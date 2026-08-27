import { parseSync } from 'vite'

interface ESTreeNode {
  type: string
  [key: string]: unknown
}

interface ProgramAst {
  program?: { body?: ESTreeNode[] }
}

const EXTENSION_TO_LANG: Record<string, 'ts' | 'tsx' | 'js' | 'jsx'> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'tsx',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'jsx',
}

function pickLang(id: string): 'ts' | 'tsx' | 'js' | 'jsx' {
  const extension = id.match(/\.([^.]+)(?:\?|$)/)?.[1]?.toLowerCase() ?? 'tsx'
  return EXTENSION_TO_LANG[extension] ?? 'tsx'
}

function findLocalCreateCallableNames(body: ESTreeNode[]): Set<string> {
  const names = new Set<string>()
  for (const node of body) {
    if (node.type !== 'ImportDeclaration') continue
    const source = (node as { source?: { value?: unknown } }).source
    if (source?.value !== '@retronew/call-vue') continue
    const specifiers = (node as { specifiers?: ESTreeNode[] }).specifiers ?? []
    for (const specifier of specifiers) {
      if (specifier.type !== 'ImportSpecifier') continue
      const imported = (specifier as { imported?: { name?: unknown } }).imported
      if (imported?.name !== 'createCallable') continue
      const local = (specifier as { local?: { name?: string } }).local
      if (local?.name) names.add(local.name)
    }
  }
  return names
}

function findManualDisplayNames(body: ESTreeNode[]): Set<string> {
  const names = new Set<string>()
  for (const node of body) {
    if (node.type !== 'ExpressionStatement') continue
    const expression = (node as { expression?: ESTreeNode }).expression
    if (expression?.type !== 'AssignmentExpression') continue
    const assignment = expression as { operator?: string; left?: ESTreeNode }
    if (assignment.operator !== '=') continue
    const left = assignment.left
    if (left?.type !== 'MemberExpression') continue
    const member = left as {
      computed?: boolean
      object?: { type?: string; name?: string }
      property?: { type?: string; name?: string }
    }
    if (
      !member.computed &&
      member.object?.type === 'Identifier' &&
      member.property?.name === 'displayName' &&
      member.object.name
    ) {
      names.add(member.object.name)
    }
  }
  return names
}

function findCallableDeclarations(body: ESTreeNode[], localNames: Set<string>): string[] {
  const callables: string[] = []
  for (const topNode of body) {
    const declaration =
      topNode.type === 'VariableDeclaration'
        ? topNode
        : topNode.type === 'ExportNamedDeclaration'
          ? (topNode as { declaration?: ESTreeNode }).declaration
          : undefined
    if (declaration?.type !== 'VariableDeclaration') continue
    const variableDeclaration = declaration as {
      kind?: string
      declarations?: Array<{ id?: { type?: string; name?: string }; init?: ESTreeNode }>
    }
    if (variableDeclaration.kind !== 'const') continue
    for (const item of variableDeclaration.declarations ?? []) {
      if (item.id?.type !== 'Identifier' || !item.id.name) continue
      const callee = (item.init as { callee?: { type?: string; name?: string } } | undefined)
        ?.callee
      if (item.init?.type === 'CallExpression' && callee?.type === 'Identifier' && callee.name) {
        if (localNames.has(callee.name)) callables.push(item.id.name)
      }
    }
  }
  return callables
}

export function transformInjectDisplayNames(code: string, id: string): string | null {
  if (!code.includes('createCallable')) return null

  let ast: ProgramAst
  try {
    ast = parseSync(id, code, { lang: pickLang(id) }) as unknown as ProgramAst
  } catch {
    return null
  }

  const body = ast.program?.body ?? []
  const localNames = findLocalCreateCallableNames(body)
  if (!localNames.size) return null
  const manuallyNamed = findManualDisplayNames(body)
  const callables = findCallableDeclarations(body, localNames).filter(
    (name) => !manuallyNamed.has(name),
  )
  if (!callables.length) return null

  const displayNames = callables.map((name) => `${name}.displayName = ${JSON.stringify(name)};`)
  return `${code}\n${displayNames.join('\n')}\n`
}
