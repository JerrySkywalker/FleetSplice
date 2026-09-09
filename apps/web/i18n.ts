export const locales = ['zh-CN', 'en-US'] as const;
export type Locale = typeof locales[number];

export const enUS = {
  pageTitle: 'FleetSplice · Local session', edition: 'LOCAL / G05C-P1', preferences: 'Preferences',
  language: 'Language', appearance: 'Appearance', localeChinese: '简体中文', localeEnglish: 'English',
  system: 'System', light: 'Light', dark: 'Dark', oledBlack: 'OLED Black', close: 'Close',
  preferencesLocal: 'Saved in this browser. Your session stays connected.',
  preferencesUnavailable: 'Applied for this page. Browser storage is unavailable.',
  yourFleet: 'YOUR FLEET', workspace: 'Workspace', localWorkspace: 'Local Workspace',
  bootstrapHint: 'Connect using the local bootstrap link', registerWorkspace: 'Register selected Workspace',
  sessions: 'Sessions', newTitle: 'New session title', defaultTitle: 'Local Codex session', newSession: '＋ New session',
  onThisMachine: 'On this machine', nativeReadOnly: 'Native Codex · Read-only',
  mainLane: 'SESSION / MAIN LANE', companion: 'Your local coding companion',
  logicalSession: 'Logical session {id} · {control}', haveControl: 'You have control', viewer: 'Viewer',
  chooseSession: 'Choose a Workspace, open a session, and start a conversation.',
  noSession: 'No session', pendingReceipt: 'Command {id} needs a receipt.', checkReceipt: 'Check command receipt',
  conversation: 'Conversation', emptyHeading: 'A real session. A local starting point.',
  emptySession: 'Acquire control, continue the session, then send a prompt. Responses stream here directly from native Codex.',
  emptyNoSession: 'Create a session from the sidebar to begin.', browser: 'Browser',
  you: 'YOU', codex: 'CODEX', session: 'SESSION', messageCodex: 'Message Codex',
  promptPlaceholder: 'Ask a question about your work…', readOnlyHint: 'Read-only native coding · No writes, network, or approval auto-allow',
  sendMessage: 'Send message', controlContext: 'CONTROL & CONTEXT', sessionControl: 'Session control',
  controllerHint: 'This browser controls the lane.', viewerHint: 'Opening a session gives you a view. Acquire control explicitly.',
  acquireControl: 'Acquire control', continueSession: 'Continue session', releaseControl: 'Release control',
  nextAcquire: '1 · Acquire control, then continue the session.',
  nextContinue: '2 · Continue session to prepare Codex. Each action has its own receipt.',
  nextPrompt: 'Ready · Write a message to Codex.',
  execution: 'Execution', host: 'Host', environment: 'Environment', agent: 'Agent', nativeAgent: 'Native Codex app-server',
  continuity: 'Continuity', sameNative: 'Same live native session', nativeUnavailable: 'Native continuity unavailable',
  nativeNotStarted: 'Native session not started', controlRevision: 'Control epoch / revision',
  nativeThread: 'Native thread', nativeTurn: 'Native turn', commandReceipt: 'Command receipt', noCommands: 'No commands yet',
  nativeCapabilities: 'Native capabilities', refreshCapabilities: 'Refresh live catalog', liveCatalogHint: 'Catalog is reported by the running native Codex app-server.',
  model: 'Model', reasoning: 'Reasoning', selectModel: 'Select a live model', selectReasoning: 'Select supported reasoning',
  requestedConfiguration: 'Requested configuration', effectiveConfiguration: 'Native effective configuration', activity: 'Native activity', noActivity: 'No native activity yet',
  footer: 'Local loop · FleetSplice 0.1 / G05C-P1',
  observationLost: 'Observation connection lost. Refresh evidence before any new action. ({code})',
  grantExpired: 'This browser has no new mutation authority. Close this run before starting a fresh attended local run. ({code})',
  requestFailed: 'Could not read the current evidence. ({code})', rejected: '{code}: command rejected before admission.',
  stillPending: 'Command remains pending. No new native request was sent.',
  commandOutcome: 'Command outcome: {code}', commandUncertain: '{code}. Use Check command receipt; no automatic retry.',
  ready: 'Ready', connecting: 'Connecting', empty: 'Not started', idle: 'Idle', running: 'Responding', pendingStatus: 'Pending',
  admitted: 'Admitted', dispatched: 'Dispatched', succeeded: 'Succeeded', rejectedStatus: 'Rejected',
  recoveryRequired: 'Recovery required', ambiguous: 'Effect unknown', observationUnknown: 'Observation unknown',
  disconnected: 'Edge disconnected', unsupportedApproval: 'Approval unsupported',
  turnCompleted: 'Turn completed', turnFailed: 'Turn failed', turnInterrupted: 'Turn interrupted',
} as const;
export type MessageKey = keyof typeof enUS;
export type Catalog = Record<MessageKey, string>;

export const zhCN = {
  pageTitle: 'FleetSplice · 本地会话', edition: '本地 / G05C-P1', preferences: '偏好设置',
  language: '语言', appearance: '外观', localeChinese: '简体中文', localeEnglish: 'English',
  system: '跟随系统', light: '浅色', dark: '深色', oledBlack: 'OLED 黑', close: '关闭',
  preferencesLocal: '已保存在此浏览器中，会话保持连接。',
  preferencesUnavailable: '已在当前页面应用，浏览器存储不可用。',
  yourFleet: '我的设备', workspace: '工作区', localWorkspace: '本地工作区',
  bootstrapHint: '请通过本地启动链接连接', registerWorkspace: '注册所选工作区',
  sessions: '会话', newTitle: '新会话名称', defaultTitle: '本地 Codex 会话', newSession: '＋ 新建会话',
  onThisMachine: '在此设备上', nativeReadOnly: '原生 Codex · 只读',
  mainLane: '会话 / 主通道', companion: '本地编程助手',
  logicalSession: '逻辑会话 {id} · {control}', haveControl: '你拥有控制权', viewer: '仅查看',
  chooseSession: '选择工作区，打开会话，开始对话。',
  noSession: '未选择会话', pendingReceipt: '命令 {id} 等待回执。', checkReceipt: '查询命令回执',
  conversation: '对话', emptyHeading: '真实会话，从本地开始。',
  emptySession: '先获取控制权，再继续会话，即可发送消息。原生 Codex 的回复将在此逐步显示。',
  emptyNoSession: '从侧栏新建会话即可开始。', browser: '浏览器',
  you: '你', codex: 'CODEX', session: '会话', messageCodex: '发送给 Codex',
  promptPlaceholder: '输入你的问题…', readOnlyHint: '原生只读编程 · 不写入、不联网、不自动批准',
  sendMessage: '发送消息', controlContext: '控制与上下文', sessionControl: '会话控制',
  controllerHint: '此浏览器拥有通道控制权。', viewerHint: '打开会话仅可查看，请先获取控制权。',
  acquireControl: '获取控制权', continueSession: '继续会话', releaseControl: '释放控制权',
  nextAcquire: '1 · 获取控制权，然后继续会话。',
  nextContinue: '2 · 继续会话以准备 Codex。每一步均有独立回执。',
  nextPrompt: '已就绪 · 可以向 Codex 发送消息。',
  execution: '执行信息', host: '设备', environment: '环境', agent: '助手', nativeAgent: '原生 Codex app-server',
  continuity: '会话连续性', sameNative: '沿用同一原生会话', nativeUnavailable: '原生会话连续性不可用',
  nativeNotStarted: '原生会话尚未启动', controlRevision: '控制代次 / 修订',
  nativeThread: '原生线程', nativeTurn: '原生轮次', commandReceipt: '命令回执', noCommands: '暂无命令',
  nativeCapabilities: '原生能力', refreshCapabilities: '刷新实时目录', liveCatalogHint: '目录由正在运行的原生 Codex app-server 报告。',
  model: '模型', reasoning: '推理强度', selectModel: '选择实时模型', selectReasoning: '选择支持的推理强度',
  requestedConfiguration: '请求配置', effectiveConfiguration: '原生生效配置', activity: '原生活动', noActivity: '尚无原生活动',
  footer: '本地链路 · FleetSplice 0.1 / G05C-P1',
  observationLost: '观测连接已断开，请先刷新状态，再执行新操作。（{code}）',
  grantExpired: '此浏览器的操作授权已过期。请先关闭本次运行，再手动启动新的本地运行。（{code}）',
  requestFailed: '无法读取当前状态。（{code}）', rejected: '{code}：命令在准入前被拒绝。',
  stillPending: '命令仍在处理中，未发送新的原生请求。',
  commandOutcome: '命令结果：{code}', commandUncertain: '{code}。请查询命令回执，系统不会自动重试。',
  ready: '已连接', connecting: '连接中', empty: '尚未启动', idle: '空闲', running: '正在回复', pendingStatus: '处理中',
  admitted: '已准入', dispatched: '已下发', succeeded: '已成功', rejectedStatus: '已拒绝',
  recoveryRequired: '需要恢复', ambiguous: '执行结果未知', observationUnknown: '观测状态未知',
  disconnected: 'Edge 已断开', unsupportedApproval: '不支持此审批',
  turnCompleted: '本轮已完成', turnFailed: '本轮失败', turnInterrupted: '本轮已中断',
} satisfies Catalog;

export const catalogs: Record<Locale, Catalog> = { 'en-US': enUS, 'zh-CN': zhCN };
export function translate(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}): string {
  return catalogs[locale][key].replace(/\{(\w+)\}/g, (token, name: string) => values[name] === undefined ? token : String(values[name]));
}
const states: Record<string, MessageKey> = {
  READY: 'ready', CONNECTING: 'connecting', EMPTY: 'empty', IDLE: 'idle', RUNNING: 'running', PENDING: 'pendingStatus',
  ADMITTED: 'admitted', DISPATCHED: 'dispatched', SUCCEEDED: 'succeeded', REJECTED: 'rejectedStatus',
  RECOVERY_REQUIRED: 'recoveryRequired', AMBIGUOUS_EFFECT: 'ambiguous', OBSERVATION_UNKNOWN: 'observationUnknown',
  EDGE_DISCONNECTED: 'disconnected', BLOCKED_UNSUPPORTED_APPROVAL: 'unsupportedApproval',
};
const machineStates = new Set(['RECOVERY_REQUIRED', 'AMBIGUOUS_EFFECT', 'OBSERVATION_UNKNOWN', 'EDGE_DISCONNECTED', 'BLOCKED_UNSUPPORTED_APPROVAL']);
export function stateText(locale: Locale, code: string): string {
  const key = Object.hasOwn(states, code) ? states[code] : undefined;
  return key ? `${translate(locale, key)}${machineStates.has(code) ? ` (${code})` : ''}` : code;
}
// Only Fleet-owned system messages are localized. User/model text and unknown codes stay literal.
export function systemText(locale: Locale, text: string): string {
  if (text === 'Turn completed') return translate(locale, 'turnCompleted');
  if (text === 'Turn failed') return translate(locale, 'turnFailed');
  if (text === 'Turn interrupted') return translate(locale, 'turnInterrupted');
  return stateText(locale, text);
}
