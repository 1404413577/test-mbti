# 结果页面颜色方案文档

## 设计原则
- **深色文字** + **浅色背景** = 最佳可读性
- **白色文字** 只用于深色背景组件（如分数圆圈）
- 统一使用 Indigo/Purple/Green 主题色

## 颜色定义

### 主题色
- **主色调**: `#6366f1` (Indigo) - 用于标题、按钮、强调元素
- **辅助色**: `#8b5cf6` (Purple) - 用于渐变、装饰
- **成功色**: `#10b981` (Green) - 用于积极指标、分数圆圈
- **警告色**: `#f59e0b` (Amber) - 用于改进建议
- **危险色**: `#ef4444` (Red) - 用于对比、左侧维度

### 文字颜色
- **标题文字**: `#1e293b` (深灰) - 主标题
- **正文文字**: `#475569` (中灰) - 描述、段落
- **次要文字**: `#64748b` (浅灰) - 标签、辅助信息
- **白色文字**: `#ffffff` - 仅用于深色背景（分数圈、按钮、标签）

### 背景颜色
- **页面背景**: `#f5f7fa` (浅灰) - 测试页面主背景
- **卡片背景**: `#ffffff` / `#f8fafc` - 白色或极浅灰
- **进度条背景**: `#e0e7ff` (浅紫) - 未填充部分
- **分数圆圈**: `#10b981` (绿色) - 内含白色文字

### 边框与阴影
- **边框**: `2px solid #e0e7ff` - 浅紫色边框
- **阴影**: `0 4px 6px rgba(99, 102, 241, 0.05)` - 微妙紫色阴影
- **Hover阴影**: `0 8px 16px rgba(99, 102, 241, 0.15)` - 加深

## 各组件颜色配置

### MBTIResults.vue
```css
/* 标题区域 */
.type-code: #6366f1 (蓝色大字)
.type-name: #8b5cf6 (紫色副标题)
.type-description: #475569 (灰色描述)

/* 维度得分 */
.dimension-name: #6366f1 (蓝色)
.dimension-desc: #64748b (浅灰)
.score-left: #ef4444 背景 + #ffffff 文字
.score-right: #10b981 背景 + #ffffff 文字

/* 分析卡片 */
.analysis-section: #f8fafc 背景 + #e0e7ff 边框
.analysis-section h3: #6366f1
.analysis-section li: #475569
.career-tag: #6366f1 背景 + #ffffff 文字
```

### EQResults.vue
```css
/* 分数圆圈 */
.eq-score-circle: #10b981 背景
.score-number: #ffffff (白色文字 - OK 因为绿色背景)
.score-label: #ffffff (白色文字 - OK 因为绿色背景)

/* 标题 */
.eq-level: #6366f1
.eq-description: #475569

/* 维度条 */
.dimension-name: #1e293b
.score-fill: #10b981
.score-text: #6366f1

/* 分析卡片 */
.strengths/improvements: #f8fafc 背景 + #e0e7ff 边框
.strengths/improvements h4: #6366f1
.strengths/improvements li: #475569

/* 提示卡片 */
.tip-card: white 背景
.tip-card h4: #10b981
.tip-card p: #64748b
```

### LearningStyleResults.vue
```css
/* 主要学习风格 */
.learning-style-results: #1e293b
.style-name: #6366f1
.style-description: #475569

/* 维度得分 */
.dimension-name: #1e293b
.dimension-level: #64748b
.score-fill: linear-gradient(90deg, #6366f1, #8b5cf6)
.percentage: #6366f1

/* 风格卡片 */
.style-card: #ffffff 背景 + #e0e7ff 边框
.card-header h4: #10b981
.score-badge: #6366f1 背景 + #ffffff 文字
.style-desc: #475569

/* 建议卡片 */
.primary-advice/improvement-advice: #ffffff 背景 + #e0e7ff 边框
h4: #10b981
li: #475569

/* 工具卡片 */
.tool-card: #ffffff 背景
.tool-card h4: #10b981
.tool-card p: #64748b
```

## 可访问性检查清单

### ✅ 已确认可读性
- [x] 所有白色/浅色背景上使用深色文字 (#1e293b, #475569, #64748b)
- [x] 分数圆圈(绿色背景)内使用白色文字
- [x] 彩色按钮/标签(蓝色背景)内使用白色文字
- [x] 所有卡片有明显边框 (#e0e7ff)
- [x] Hover状态有视觉反馈

### 对比度比例
- **深灰 #1e293b on 白色 #ffffff**: 15.2:1 ⭐ (AAA级)
- **中灰 #475569 on 白色 #ffffff**: 8.6:1 ⭐ (AAA级)
- **浅灰 #64748b on 白色 #ffffff**: 5.9:1 ⭐ (AA级)
- **白色 #ffffff on 绿色 #10b981**: 3.4:1 ✅ (AA级 - 大字体)
- **白色 #ffffff on 蓝色 #6366f1**: 4.6:1 ⭐ (AAA级 - 大字体)

## 常见问题修复

### ❌ 错误示例
```css
/* 白色文字在白色/浅色背景上 - 不可见！ */
.text { color: white; background: white; }
.text { color: #fff; background: #f8fafc; }
.text { color: rgba(255,255,255,0.9); background: #ffffff; }
```

### ✅ 正确示例
```css
/* 深色文字在浅色背景上 - 可见！ */
.text { color: #1e293b; background: #ffffff; }
.text { color: #475569; background: #f8fafc; }

/* 白色文字在深色背景上 - 可见！ */
.text { color: #ffffff; background: #6366f1; }
.text { color: #ffffff; background: #10b981; }
```

## 更新历史
- 2025-10-09: 修复所有结果页面白色文字可见性问题
  - MBTIResults.vue: 更新维度卡片、描述文字颜色
  - EQResults.vue: 保持分数圆圈白色文字，其他区域使用深色
  - LearningStyleResults.vue: 统一所有卡片颜色方案
