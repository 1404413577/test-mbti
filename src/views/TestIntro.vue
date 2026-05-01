<template>
  <div class="intro-page-wrapper">
    <div class="page-header-wrapper">
      <el-page-header :content="t('intro.pageTitle')" @back="goBack" />
    </div>

    <el-card class="hero-section" shadow="hover" :body-style="{ padding: '0' }">
      <el-row align="middle">
        <el-col :xs="24" :lg="12" class="hero-content">
          <div class="pro-badge">PROFESSIONAL EDITION</div>
          <h1 class="hero-title">{{ t('intro.hero.title') }}</h1>
          <p class="hero-subtitle">{{ t('intro.hero.description') }}</p>
          
          <div class="hero-stats" v-if="heroStats.length">
            <div v-for="stat in heroStats" :key="stat.label" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <div class="hero-actions">
            <el-button type="primary" size="large" class="main-btn" @click="startTest">
              {{ t('intro.hero.primary') }}
              <el-icon class="el-icon--right"><Right /></el-icon>
            </el-button>
            <el-button size="large" plain class="secondary-btn" @click="goToOverview">
              {{ t('intro.hero.secondary') }}
            </el-button>
          </div>
        </el-col>
        
        <el-col :xs="24" :lg="12" class="hero-carousel-col">
          <el-carousel height="480px" indicator-position="inside" arrow="hover" class="hero-carousel">
            <el-carousel-item v-for="(img, index) in galleryImages" :key="index">
              <el-image :src="img" fit="cover" class="carousel-image">
                <template #error>
                  <div class="placeholder-content">
                    <el-icon class="placeholder-icon"><Monitor /></el-icon>
                    <span class="placeholder-text">SYSTEM PREVIEW 0{{ index + 1 }}</span>
                    <span class="placeholder-subtext">建议尺寸: 800x600 px (应用界面截图)</span>
                  </div>
                </template>
              </el-image>
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-card>

    <div class="section-container">
      <div class="section-header">
        <h2>测评架构支柱</h2>
        <p>基于权威心理学理论，提供精准的数据化洞察</p>
      </div>
      <el-row :gutter="24" class="pillars-row">
        <el-col v-for="pillar in introPillars" :key="pillar.title" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="pillar-card">
            <div class="pillar-icon-wrapper">
              <component :is="pillar.icon" class="pillar-icon" />
            </div>
            <h3>{{ pillar.title }}</h3>
            <p class="pillar-desc">{{ pillar.description }}</p>
            <ul class="pillar-highlights" v-if="pillar.highlights">
              <li v-for="(highlight, idx) in pillar.highlights" :key="idx">
                <el-icon class="check-icon"><Select /></el-icon>
                <span>{{ highlight }}</span>
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section-container">
      <el-row :gutter="40">
        <el-col :xs="24" :lg="12">
          <el-card class="flow-card" shadow="never">
            <template #header>
              <div class="card-header-simple">
                <h3>{{ t('intro.sections.flowTitle') }}</h3>
                <span>STANDARD PROCESS</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in introFlow"
                :key="item.title"
                :timestamp="item.duration"
                placement="top"
                :type="index === 0 ? 'primary' : 'info'"
                size="large"
              >
                <div class="timeline-step">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="step-details" v-if="item.details">
                    <span v-for="(detail, idx) in item.details" :key="idx" class="detail-tag">
                      <el-icon><Check /></el-icon> {{ detail }}
                    </span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="tech-card" shadow="never">
            <template #header>
              <div class="card-header-simple">
                <h3>{{ techFeatures.title || '技术与安全保障' }}</h3>
                <span>ENTERPRISE GRADE</span>
              </div>
            </template>
            <div class="tech-grid">
              <div v-for="feature in techFeatures.items" :key="feature.title" class="tech-item">
                <el-icon class="tech-icon"><component :is="getFeatureIcon(feature.icon)" /></el-icon>
                <div class="tech-info">
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.description }}</p>
                </div>
              </div>
            </div>
            
            <el-divider border-style="dashed" />
            
            <div class="trust-grid" v-if="trustSection.items">
              <div v-for="item in trustSection.items" :key="item.title" class="trust-item">
                <el-icon class="trust-icon"><Shield /></el-icon>
                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section-container">
      <div class="section-header">
        <h2>{{ t('intro.sections.galleryTitle') }}</h2>
        <p>{{ t('intro.sections.galleryDescription') }}</p>
      </div>
      
      <el-row :gutter="20" class="gallery-grid">
        <el-col v-for="(image, index) in galleryImages" :key="index" :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" :body-style="{ padding: '0px' }" class="gallery-card">
            <el-image 
              :src="image" 
              fit="cover" 
              class="gallery-image"
              :preview-src-list="galleryImages"
              :initial-index="index"
            >
              <template #error>
                <div class="placeholder-content small-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>截图 0{{ index + 1 }}</span>
                </div>
              </template>
            </el-image>
          </el-card>
        </el-col>
      </el-row>

      <div class="bottom-actions">
        <el-button type="primary" size="large" class="main-btn" @click="startTest">
          {{ t('intro.sections.cta.start') }}
          <el-icon class="el-icon--right"><Pointer /></el-icon>
        </el-button>
        <el-button size="large" plain class="secondary-btn" @click="goToOverview">
          {{ t('intro.sections.cta.back') }}
        </el-button>
      </div>
    </div>

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
// 全面使用 Element Plus 官方图标
import {
  Right, Monitor, Select, Check, Grid, Cpu, TrendCharts, 
  PictureFilled, CircleCheck, Pointer, DataAnalysis, Connection, Key, Picture
} from '@element-plus/icons-vue'

const router = useRouter()
const { t, tm } = useI18n()

// 替换为 public 目录的路径，即使文件不存在，也会优雅降级为 placeholder
const galleryImages = [
  '/images/intro-preview-1.png',
  '/images/intro-preview-2.png',
  '/images/intro-preview-3.png',
  '/images/intro-preview-4.png'
]

const pillarsIconMap = {
  medal: DataAnalysis,
  chat: Connection,
  light: Key
}

const featureIconMap = {
  grid: Grid,
  cpu: Cpu,
  chart: TrendCharts,
  picture: PictureFilled
}

const heroStats = computed(() => tm('intro.hero.stats') || [])

const introPillars = computed(() => {
  const pillars = tm('intro.pillars') || []
  return pillars.map((pillar) => ({
    ...pillar,
    icon: pillarsIconMap[pillar.icon] || DataAnalysis
  }))
})

const introFlow = computed(() => tm('intro.sections.flow') || [])

const techFeatures = computed(() => {
  return tm('intro.sections.features') || { title: '', description: '', items: [] }
})

const trustSection = computed(() => {
  return tm('intro.sections.trust') || { title: '', items: [] }
})

const getFeatureIcon = (iconName) => {
  return featureIconMap[iconName] || Shield
}

const goBack = () => router.push('/test-overview')
const goToOverview = () => router.push('/test-overview')
const startTest = () => router.push('/md-test/mbti')
</script>

<style scoped>
.intro-page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 6rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1e293b;
}

.page-header-wrapper {
  margin-bottom: 2.5rem;
}

/* ================= 占位图规范 ================= */
.placeholder-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  color: #94a3b8;
  border-left: 1px solid #e2e8f0;
}
.placeholder-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.placeholder-text { font-size: 1.1rem; font-weight: 700; letter-spacing: 1px; }
.placeholder-subtext { font-size: 0.8rem; margin-top: 0.4rem; }
.small-placeholder { border: none; background: #f1f5f9; }
.small-placeholder .el-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.small-placeholder span { font-size: 0.9rem; font-weight: 600; }

/* ================= 首屏 Hero ================= */
.hero-section {
  border-radius: 20px;
  margin-bottom: 5rem;
  border: 1px solid #e2e8f0;
}

.hero-content {
  padding: 4rem 3rem;
}

.pro-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #4f46e5;
  background: #e0e7ff;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 2.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin: 0 0 1.2rem 0;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.hero-stats {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.2rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.hero-actions { display: flex; gap: 1rem; }
.main-btn, .secondary-btn { padding: 0 2rem; font-weight: 600; }

.hero-carousel-col {
  height: 100%;
}
.hero-carousel { background: #f8fafc; }
.carousel-image { width: 100%; height: 100%; }

/* ================= 核心支柱 ================= */
.section-container { margin-bottom: 5rem; }
.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-header h2 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0; }
.section-header p { font-size: 1.1rem; color: #64748b; margin: 0; }

.pillar-card {
  height: 100%;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.pillar-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #e0e7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.pillar-icon { font-size: 1.5rem; color: #4f46e5; }
.pillar-card h3 { font-size: 1.3rem; font-weight: 700; margin: 0 0 1rem 0; color: #1e293b; }
.pillar-desc { color: #475569; line-height: 1.6; font-size: 0.95rem; margin-bottom: 1.5rem; }

.pillar-highlights { list-style: none; padding: 0; margin: 0; border-top: 1px dashed #e2e8f0; padding-top: 1.5rem; }
.pillar-highlights li { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.8rem; font-size: 0.9rem; color: #334155; }
.check-icon { color: #10b981; margin-top: 2px; }

/* ================= 流程与特性 ================= */
.card-header-simple { display: flex; flex-direction: column; }
.card-header-simple h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #0f172a; }
.card-header-simple span { font-size: 0.75rem; color: #94a3b8; font-weight: 700; letter-spacing: 1px; margin-top: 0.3rem; }

.flow-card, .tech-card {
  border-radius: 16px;
  background: #f8fafc;
  height: 100%;
}

.timeline-step h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b; }
.timeline-step p { margin: 0 0 0.8rem 0; font-size: 0.95rem; color: #64748b; line-height: 1.6; }
.step-details { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.detail-tag { background: white; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; color: #475569; display: flex; align-items: center; gap: 4px; }
.detail-tag .el-icon { color: #10b981; }

.tech-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 1.5rem; }
.tech-item, .trust-item { display: flex; align-items: flex-start; gap: 1rem; }
.tech-icon { font-size: 1.8rem; color: #6366f1; background: white; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; }
.tech-info h4, .trust-item h4 { margin: 0 0 0.4rem 0; font-size: 1.05rem; color: #1e293b; }
.tech-info p, .trust-item p { margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.5; }

.trust-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
.trust-icon { font-size: 1.5rem; color: #10b981; margin-top: 4px; }

/* ================= 界面展示 ================= */
.gallery-card { border-radius: 12px; cursor: pointer; }
.gallery-image { width: 100%; height: 180px; display: block; }
.bottom-actions { margin-top: 3rem; display: flex; justify-content: center; gap: 1rem; }

@media (max-width: 992px) {
  .hero-content { padding: 3rem 2rem; }
  .hero-carousel { height: 300px; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .hero-actions, .bottom-actions { flex-direction: column; }
  .main-btn, .secondary-btn { width: 100%; }
  .hero-stats { flex-wrap: wrap; gap: 1.5rem; }
  .flow-card { margin-bottom: 2rem; }
}
</style>