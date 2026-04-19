# ChemMemo 复习 Tab（学习效果优先）设计稿

## 1. 目标
- 提升学习效果：让“学过的方程式”在遗忘前被复习、让“常错点”被针对强化。
- 降低执行门槛：默认每日任务 10 题，一键开始。
- 输出可解释反馈：复习维度按错因标签（条件/符号/生成物/配平）可追踪与可统计。

## 2. 结论（已确认）
- 入口方案：新增底部 Tab「复习」（方案 B）。
- 模式：混合 + 每日任务。
- 每日任务默认题量：10。
- SRS 节奏（轻量）：答对后间隔按 1天 → 3天 → 7天 → 14天；答错回到 1天。

## 3. 范围与非目标
### 3.1 本期范围
- 新增「复习」页面（Tab 入口或等价入口）。
- 建立本地 SRS 队列（LocalStorage），可生成“今日到期”与“弱点强化”题单。
- 将每次答题的结果写入复习系统（方程式维度 + 错因标签）。
- 复习会话：默认 10 题，按“到期优先 + 弱点补齐 + 新题兜底”出题。
- 基础统计：今日任务进度、弱点分布（至少四类错因）。

### 3.2 非目标（后续）
- 完整 SM-2 / EF 参数。
- 云端登录与多端同步。
- 复杂图表与排行榜。

## 4. 信息架构与 UI 草案（文本版）
### 4.1 底部导航
- 学习（现有地图）
- 复习（新增）
- 档案（若已有则保留；若无，可后续补）

### 4.2 复习页结构
1) 今日任务卡片
   - 标题：今日任务（10 题）
   - 子信息：到期 X / 弱点补齐 Y
   - CTA：开始复习
2) 到期复习卡片
   - 展示：今日到期数量
   - CTA：只做到期
3) 弱点强化卡片
   - 展示：条件 / 符号 / 生成物 / 配平 的占比或排名
   - CTA：刷一组（例如 10 题或 5 题）

## 5. 数据模型（LocalStorage）
以现有 zustand persist 为基础扩展，使用 `chemmemo-storage`。

### 5.1 ReviewItem（按 equationId 存储）
- equationId: string
- nextDueAt: string（ISO 日期，精确到天即可，例如 2026-04-15）
- streak: number（连续正确次数，用于决定间隔档位）
- wrongCounts: Record<MistakeTag, number>
- lastResultAt: string（ISO datetime）

### 5.2 MistakeTag（错因标签）
最小集合（本期）：
- condition_missing
- condition_wrong
- symbol_missing_or_wrong
- products_wrong
- balance_wrong

### 5.3 DailyReview（按日期）
- date: string（YYYY-MM-DD）
- targetCount: number（默认 10）
- doneCount: number
- correctCount: number
- mistakes: Record<MistakeTag, number>

## 6. SRS 规则（轻量）
### 6.1 streak → 间隔映射
- streak = 0：nextDue = 今天（新题可视为到期）
- streak = 1：+1 天
- streak = 2：+3 天
- streak = 3：+7 天
- streak >= 4：+14 天

### 6.2 更新规则
- 答对：streak += 1，nextDueAt = today + interval(streak)
- 答错：streak = 1（或 0），nextDueAt = today + 1 天，并记录错因标签计数

## 7. 出题策略（每日任务 10 题）
### 7.1 数据集
从当前题库（equations）按 equationId 取方程式。

### 7.2 选题顺序
1) 到期优先：挑选 nextDueAt <= today 的方程式
2) 弱点补齐：按 wrongCounts 聚合到错因标签，优先抽最弱标签对应的方程式
3) 新题兜底：从没有 ReviewItem 的方程式中抽取

### 7.3 题型分配
在可用题型内尽量覆盖：
- balance / cloze / match / recall 至少各 1 题（题量允许时）
若某方程式不适合某题型（例如无法解析系数），则跳过。

## 8. 复习会话流程
- 复习页点击「开始复习」进入练习页（可复用现有 Lesson，或新增 ReviewSession 页面）
- 每题提交后：
  - 生成结构化评估结果：correct、mistakeTags[]
  - 写入 ReviewItem 与 DailyReview
- 会话结束页：
  - 今日任务进度（done/10）
  - 错因分布（条件/符号/生成物/配平）
  - CTA：继续复习 / 返回

## 9. 与现有“错因提示”的衔接方式
现有 UI 已展示“错因：xxx（文本）”，本期需要补充一层结构化输出：
- grader 返回 `mistakeTags: MistakeTag[]`
- UI 仍可展示自然语言，但数据层持久化使用 tag，便于统计与筛选。

## 10. 验收标准
- 新增复习入口（Tab）可正常进入复习页。
- 点击开始复习可生成 10 题，优先抽到期题。
- 答错会入库，次日可在“到期复习”看到数量变化。
- 弱点强化会随着错因累积而变化（至少能看到某标签占比上升）。

## 11. 测试要点
- 日期切换：模拟跨天后到期计算正确。
- 重复答题：同一 equationId 多次答题能更新 streak、nextDueAt、wrongCounts。
- 题型覆盖：每日 10 题能稳定出现非选择题（balance/cloze/match/recall）。

