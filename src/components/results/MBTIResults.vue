<template>
  <div class="mbti-results-container">
    <div class="print-header">
      <div class="print-logo">MBTI 深度性格解析报告</div>
      <div>生成日期: {{ currentDate }}</div>
    </div>

    <!-- 1. Hero -->
    <el-card class="hero-card" shadow="hover">
      <div class="hero-content">
        <h3 class="hero-subtitle">您的迈尔斯-布里格斯性格类型指数 (MBTI) 为：</h3>
        <h1 class="type-code">{{ personalityType }}</h1>
        <h2 class="type-name">{{ db.name }} - {{ db.title }}</h2>
        <el-divider border-style="dashed" />
        <p class="type-slogan">" {{ db.slogan }} "</p>
      </div>
    </el-card>

    <!-- 2. Dimension Bipolar Bars -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">📊 您的认知维度图谱</span>
        </div>
      </template>
      <div class="dimensions-list">
        <div v-for="dim in dimensionScores" :key="dim.name" class="dimension-item">
          <el-row :gutter="20" align="middle">
            <el-col :xs="24" :sm="6">
              <div class="dim-info">
                <strong>{{ dim.name }}</strong>
                <span class="dim-desc">{{ dim.desc }}</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="18">
              <div class="bipolar-bar-container">
                <div class="label-left" :class="{ 'is-active': dim.preference === dim.leftKey }">
                  {{ dim.leftLabel }} ({{ dim.leftScore }})
                </div>
                <div class="bipolar-bar">
                  <div class="bar-left" :style="{ width: dim.leftPercentage + '%' }" />
                  <div class="bar-center-line" />
                  <div class="bar-right" :style="{ width: dim.rightPercentage + '%' }" />
                </div>
                <div class="label-right" :class="{ 'is-active': dim.preference === dim.rightKey }">
                  ({{ dim.rightScore }}) {{ dim.rightLabel }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <p class="chart-caption">注：进度条偏向代表您在处理信息、做决策时的主导偏好。得分越悬殊，代表该特质越明显；得分接近代表您能在两者间灵活切换。</p>
    </el-card>

    <!-- 3. Radar Chart -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🎯 认知功能雷达图</span>
        </div>
      </template>
      <div class="radar-wrapper">
        <Radar :data="radarData" :options="radarOptions" />
      </div>
      <p class="chart-caption">基于您的测评得分推算的八项认知功能强度分布，反映您在不同心理功能上的倾向性。</p>
    </el-card>

    <!-- 4. Cognitive Functions Stack -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🧠 认知功能栈解析</span>
        </div>
      </template>
      <div class="cognitive-stack">
        <div v-for="(fn, idx) in cognitiveStack" :key="fn.code" class="cognitive-item">
          <div class="cog-rank" :class="functionLevelClass(idx)">
            <span class="cog-rank-num">#{{ idx + 1 }}</span>
            <span class="cog-rank-label">{{ functionLevelLabel(idx) }}</span>
          </div>
          <div class="cog-body">
            <div class="cog-header">
              <span class="cog-name">{{ fn.code }} — {{ fn.name }}</span>
              <el-progress :percentage="fn.score" :color="cogColor(idx)" :stroke-width="8" />
            </div>
            <p class="cog-desc">{{ fn.desc }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 5. Core Profile + Strengths -->
    <el-row :gutter="24">
      <el-col :xs="24" :lg="14">
        <el-card class="section-card" shadow="hover">
          <h3 class="block-title">📌 核心画像</h3>
          <p class="block-text">{{ db.core }}</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="section-card" shadow="hover">
          <h3 class="block-title">💪 核心优势</h3>
          <div v-for="s in db.strengths" :key="s.title" class="strength-item">
            <div class="strength-header">
              <span class="strength-icon">✦</span>
              <strong>{{ s.title }}</strong>
            </div>
            <p class="strength-desc">{{ s.desc }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 6. Career Pathways -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">💼 职业与事业轨迹</span>
        </div>
      </template>
      <div class="tags-container">
        <el-tag
          v-for="c in db.careers" :key="c"
          effect="dark" round class="career-tag"
          color="#6366f1" style="border: none;"
        >{{ c }}</el-tag>
      </div>
    </el-card>

    <!-- 7. Ideal Work Environment -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🏢 理想工作环境</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12">
          <div class="env-box ideal">
            <h4 class="env-label">✅ 理想环境</h4>
            <p>{{ db.workEnv.ideal }}</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="env-box avoid">
            <h4 class="env-label">⚠️ 应避免</h4>
            <p>{{ db.workEnv.avoid }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 8. Leadership Style -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">👔 领导风格</span>
        </div>
      </template>
      <div class="style-card">
        <el-tag effect="dark" round color="#6366f1" style="border:none;font-size:1rem;padding:0 16px;height:32px;line-height:30px;margin-bottom:1rem;">
          {{ db.leadership.style }}
        </el-tag>
        <p class="block-text">{{ db.leadership.detail }}</p>
      </div>
    </el-card>

    <!-- 9. Communication Style -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">💬 沟通风格</span>
        </div>
      </template>
      <div class="style-card">
        <el-tag effect="dark" round color="#10b981" style="border:none;font-size:1rem;padding:0 16px;height:32px;line-height:30px;margin-bottom:1rem;">
          {{ db.communication.style }}
        </el-tag>
        <p class="block-text">{{ db.communication.detail }}</p>
      </div>
    </el-card>

    <!-- 10. Relationships & Compatibility -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">❤️ 亲密关系与社交</span>
        </div>
      </template>
      <div class="relate-love">
        <h4 class="sub-heading">💕 恋爱风格</h4>
        <p class="block-text">{{ db.relationships.love }}</p>
      </div>
      <el-divider />
      <div class="relate-match">
        <h4 class="sub-heading">💘 最佳匹配类型</h4>
        <div class="match-types">
          <span v-for="m in db.relationships.bestMatch" :key="m" class="match-tag">{{ m }}</span>
        </div>
        <p class="match-reason">{{ db.relationships.matchReason }}</p>
      </div>
    </el-card>

    <!-- 11. Learning Style -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">📚 学习风格</span>
        </div>
      </template>
      <p class="block-text" style="margin-bottom:1rem;"><strong>{{ db.learning.style }}</strong></p>
      <ul class="tips-list">
        <li v-for="t in db.learning.tips" :key="t">{{ t }}</li>
      </ul>
    </el-card>

    <!-- 12. Stress Management -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🌊 压力管理</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <h4 class="sub-heading">⚠️ 压力触发源</h4>
          <ul class="tips-list">
            <li v-for="t in db.stress.triggers" :key="t">{{ t }}</li>
          </ul>
          <el-alert
            title="压力预警信号"
            :description="db.stress.signals"
            type="warning" show-icon :closable="false" class="mt-3"
          />
        </el-col>
        <el-col :xs="24" :md="12">
          <h4 class="sub-heading">🛟 应对策略</h4>
          <ul class="tips-list">
            <li v-for="c in db.stress.coping" :key="c">{{ c }}</li>
          </ul>
        </el-col>
      </el-row>
    </el-card>

    <!-- 13. Famous Figures -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🌟 名人代表</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col v-for="f in db.famousFigures" :key="f.name" :xs="12" :sm="6">
          <div class="famous-card">
            <div class="famous-avatar">👤</div>
            <strong>{{ f.name }}</strong>
            <span class="famous-desc">{{ f.desc }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 14. Growth Roadmap -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">🗺️ 个人成长路线图</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="g in db.growthPlan" :key="g.phase"
          :timestamp="g.phase"
          placement="top"
          color="#6366f1"
          size="large"
        >
          <el-card shadow="hover" class="growth-card">
            <p>{{ g.action }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 15. Blind Spots & Tips -->
    <el-card class="section-card" shadow="hover">
      <el-alert
        title="⚠️ 潜在盲区与内耗来源"
        type="warning"
        :description="db.blindSpot"
        show-icon :closable="false"
        class="mb-4 custom-alert"
      />
      <h3 class="block-title mt-4">💡 个人进阶建议</h3>
      <ul class="tips-list">
        <li v-for="t in db.tips" :key="t">{{ t }}</li>
      </ul>
    </el-card>

    <div class="print-footer">
      <p>本测评基于荣格的心理类型理论及 MBTI 框架编制，旨在促进自我认知与个人成长。</p>
      <p>温馨提示：性格类型没有优劣之分，且可能随着阅历与环境发生微调，请将此报告作为探索自我的向导，而非限制您的标签。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { mbtiDatabase, functionNames, functionDescs, functionStacks, functionLevel, functionLevelClass } from '@/data/mbti-database.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] },
  testType: String,
})

const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const dimensionScores = computed(() => {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  props.answers.forEach((answer) => {
    if (answer && answer.scoring) {
      Object.keys(answer.scoring).forEach((dim) => {
        if (scores[dim] !== undefined) scores[dim] += answer.scoring[dim]
      })
    }
  })
  const getPct = (a, b) => {
    const total = a + b
    return total === 0 ? 50 : Math.round((a / total) * 100)
  }
  return [
    { name: '能量来源 (E-I)', desc: '你从哪里获取动力？', leftKey: 'E', rightKey: 'I', leftLabel: '外倾 (E)', rightLabel: '内倾 (I)', leftScore: scores.E, rightScore: scores.I, leftPercentage: getPct(scores.E, scores.I), rightPercentage: getPct(scores.I, scores.E), preference: scores.E > scores.I ? 'E' : 'I' },
    { name: '信息收集 (S-N)', desc: '你如何看待世界？', leftKey: 'S', rightKey: 'N', leftLabel: '感觉 (S)', rightLabel: '直觉 (N)', leftScore: scores.S, rightScore: scores.N, leftPercentage: getPct(scores.S, scores.N), rightPercentage: getPct(scores.N, scores.S), preference: scores.S > scores.N ? 'S' : 'N' },
    { name: '判断决策 (T-F)', desc: '你如何做决定？', leftKey: 'T', rightKey: 'F', leftLabel: '思考 (T)', rightLabel: '情感 (F)', leftScore: scores.T, rightScore: scores.F, leftPercentage: getPct(scores.T, scores.F), rightPercentage: getPct(scores.F, scores.T), preference: scores.T > scores.F ? 'T' : 'F' },
    { name: '生活方式 (J-P)', desc: '你如何组织生活？', leftKey: 'J', rightKey: 'P', leftLabel: '判断 (J)', rightLabel: '知觉 (P)', leftScore: scores.J, rightScore: scores.P, leftPercentage: getPct(scores.J, scores.P), rightPercentage: getPct(scores.P, scores.J), preference: scores.J > scores.P ? 'J' : 'P' },
  ]
})

const rawScores = computed(() => {
  const s = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  props.answers.forEach((a) => {
    if (a && a.scoring) Object.keys(a.scoring).forEach((d) => { if (s[d] !== undefined) s[d] += a.scoring[d] })
  })
  return s
})

const personalityType = computed(() => dimensionScores.value.map((d) => d.preference).join(''))

const db = computed(() => mbtiDatabase[personalityType.value] || mbtiDatabase['INTJ'])

const functionLevelLabel = (idx) => functionLevel(idx)

const cogColor = (idx) => {
  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff']
  return colors[idx] || colors[4]
}

// Compute cognitive function scores from dimension scores
const cognitiveStack = computed(() => {
  const stack = functionStacks[personalityType.value] || functionStacks['INTJ']
  const s = rawScores.value
  const weightByPos = [1.0, 0.7, 0.5, 0.3, 0.15, 0.12, 0.1, 0.08]

  const entries = stack.map((code, idx) => {
    const letter = code[1]
    const orient = code[0]
    const dimScore = (letter === 'N') ? s.N : (letter === 'S') ? s.S : (letter === 'T') ? s.T : s.F
    const orientScore = orient === 'I' ? s.I : s.E
    const raw = dimScore * weightByPos[idx] + orientScore * weightByPos[idx] * 0.3
    const score = Math.min(98, Math.max(10, Math.round(raw)))
    return { code, name: functionNames[code], desc: functionDescs[code], score }
  })

  return entries
})

// Radar chart data
const radarData = computed(() => {
  const entries = cognitiveStack.value.slice(0, 8)
  return {
    labels: entries.map((e) => e.code),
    datasets: [{
      label: personalityType.value,
      data: entries.map((e) => e.score),
      backgroundColor: 'rgba(99,102,241,0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  }
})

const radarOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      beginAtZero: false,
      min: 0,
      max: 100,
      ticks: { stepSize: 20, backdropColor: 'transparent' },
      pointLabels: { font: { size: 13, weight: 'bold' } },
    },
  },
  plugins: {
    legend: { display: false },
  },
}
</script>

<style scoped>
.mbti-results-container {
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.section-card {
  margin-bottom: 2rem;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.hero-card {
  margin-bottom: 2.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e0e7ff;
}

.hero-content { text-align: center; padding: 2rem 1rem; }
.hero-subtitle { color: #64748b; font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem; }
.type-code { font-size: 5rem; font-weight: 900; color: #6366f1; margin: 0; letter-spacing: 0.1em; text-shadow: 0 4px 12px rgba(99,102,241,0.2); }
.type-name { font-size: 1.8rem; color: #1e293b; margin-top: 0.5rem; margin-bottom: 1.5rem; }
.type-slogan { font-size: 1.3rem; color: #8b5cf6; font-style: italic; font-weight: 600; margin-top: 1.5rem; }

.section-title { font-size: 1.4rem; font-weight: 800; color: #1e293b; }

/* Bipolar bars */
.dimensions-list { padding: 1rem 0; }
.dimension-item { margin-bottom: 2rem; }
.dimension-item:last-child { margin-bottom: 0; }
.dim-info strong { display: block; font-size: 1.15rem; color: #334155; margin-bottom: 0.2rem; }
.dim-desc { font-size: 0.9rem; color: #64748b; }
.bipolar-bar-container { display: flex; align-items: center; gap: 1rem; }
.label-left, .label-right { min-width: 85px; font-size: 0.95rem; font-weight: 600; color: #94a3b8; transition: color 0.3s; }
.label-left { text-align: right; }
.label-right { text-align: left; }
.label-left.is-active { color: #f43f5e; }
.label-right.is-active { color: #10b981; }
.bipolar-bar { flex: 1; height: 24px; background: #f1f5f9; border-radius: 12px; display: flex; position: relative; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.bar-center-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.8); z-index: 2; }
.bar-left { background: linear-gradient(90deg, #fb7185, #f43f5e); transition: width 1s cubic-bezier(0.4,0,0.2,1); }
.bar-right { background: linear-gradient(90deg, #34d399, #10b981); transition: width 1s cubic-bezier(0.4,0,0.2,1); }

.chart-caption { font-size: 0.85rem; color: #94a3b8; text-align: center; margin-top: 1rem; }

/* Radar */
.radar-wrapper { max-width: 500px; margin: 0 auto; }

/* Cognitive Stack */
.cognitive-stack { display: flex; flex-direction: column; gap: 1rem; }
.cognitive-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #6366f1; transition: transform 0.2s; }
.cognitive-item:hover { transform: translateX(4px); }
.cog-rank { min-width: 90px; text-align: center; }
.cog-rank-num { display: block; font-size: 1.5rem; font-weight: 900; color: #6366f1; }
.cog-rank-label { font-size: 0.7rem; color: #64748b; white-space: nowrap; }
.cog-body { flex: 1; }
.cog-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.4rem; }
.cog-name { font-weight: 700; font-size: 1rem; color: #1e293b; white-space: nowrap; min-width: 120px; }
.cog-header :deep(.el-progress) { flex: 1; }
.cog-desc { font-size: 0.9rem; color: #64748b; margin: 0; }

/* Text */
.block-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-top: 0; margin-bottom: 0.8rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 2rem; }
.mb-4 { margin-bottom: 1.5rem; }
.block-text { font-size: 1.05rem; line-height: 1.8; color: #475569; text-align: justify; margin: 0; }
.sub-heading { font-size: 1.05rem; font-weight: 700; color: #334155; margin: 0 0 0.8rem; }

/* Strengths */
.strength-item { padding: 1rem; margin-bottom: 0.8rem; background: #f8fafc; border-radius: 10px; }
.strength-item:last-child { margin-bottom: 0; }
.strength-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.strength-icon { color: #6366f1; font-size: 1.1rem; }
.strength-header strong { color: #1e293b; font-size: 1rem; }
.strength-desc { font-size: 0.9rem; color: #64748b; margin: 0; padding-left: 1.6rem; }

/* Careers */
.tags-container { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1rem; }
.career-tag { font-size: 0.95rem; padding: 0 16px; height: 32px; line-height: 30px; }

/* Work Env */
.env-box { padding: 1.5rem; border-radius: 12px; height: 100%; }
.env-box.ideal { background: #f0fdf4; border: 1px solid #dcfce7; }
.env-box.avoid { background: #fef2f2; border: 1px solid #fee2e2; }
.env-label { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 700; }
.env-box.ideal .env-label { color: #16a34a; }
.env-box.avoid .env-label { color: #dc2626; }
.env-box p { font-size: 0.95rem; line-height: 1.7; color: #475569; margin: 0; }

/* Style cards */
.style-card { padding: 0.5rem 0; }

/* Relationships */
.relate-love { margin-bottom: 0.5rem; }
.match-types { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
.match-tag { display: inline-block; padding: 0.4rem 1.2rem; background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #be185d; border-radius: 20px; font-weight: 700; font-size: 1.1rem; }
.match-reason { font-size: 0.95rem; color: #64748b; margin: 0; }

/* Tips */
.tips-list { padding-left: 1.2rem; margin: 0; }
.tips-list li { font-size: 1rem; line-height: 1.6; color: #475569; margin-bottom: 0.5rem; }
.custom-alert :deep(.el-alert__title),
.custom-alert :deep(.el-alert__description) { font-size: 1rem; line-height: 1.6; }

/* Famous */
.famous-card { text-align: center; padding: 1rem; background: #f8fafc; border-radius: 12px; transition: transform 0.2s; }
.famous-card:hover { transform: translateY(-4px); }
.famous-avatar { font-size: 2.5rem; margin-bottom: 0.5rem; }
.famous-card strong { display: block; font-size: 0.95rem; color: #1e293b; margin-bottom: 0.2rem; }
.famous-desc { font-size: 0.8rem; color: #94a3b8; }

/* Growth */
.growth-card p { margin: 0; font-size: 0.95rem; color: #475569; }

/* Print styles */
.print-header, .print-footer { display: none; }
@media print {
  @page { size: A4; margin: 15mm; }
  body, .mbti-results-container { background: white !important; color: #000 !important; }
  .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold; }
  .print-footer { display: block; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
  .section-card, .hero-card { border: none !important; box-shadow: none !important; margin-bottom: 20px; padding: 0 !important; }
  .el-card__body { padding: 0 !important; }
  .bipolar-bar { border: 1px solid #ccc; background: #fff !important; }
  .bar-left, .bar-right { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .career-tag { border: 1px solid #6366f1 !important; color: #000 !important; background: transparent !important; }
  .cognitive-item { break-inside: avoid; }
  .famous-card { break-inside: avoid; }
}

@media (max-width: 768px) {
  .bipolar-bar-container { flex-direction: column; gap: 0.5rem; align-items: stretch; margin-top: 0.5rem; }
  .label-left { text-align: left; }
  .type-code { font-size: 4rem; }
  .cognitive-item { flex-direction: column; }
  .cog-rank { display: flex; align-items: center; gap: 0.5rem; min-width: auto; }
  .cog-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .cog-name { min-width: auto; }
}
</style>
