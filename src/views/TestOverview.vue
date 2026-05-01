<template>
  <div class="overview-container">
    <div class="page-header-wrapper">
      <el-page-header :content="t('overview.pageTitle')" @back="goBack" />
    </div>

    <el-row :gutter="40" align="middle" class="hero-section">
      <el-col :xs="24" :lg="11" class="hero-text-area">
        <div class="tag-line">SCIENTIFIC & OBJECTIVE</div>
        <h1 class="hero-title">{{ t("overview.pageTitle") }}</h1>
        <p class="hero-subtitle">{{ t("overview.pageSubtitle") }}</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="action-btn" @click="goToTests">
            {{ t("overview.cta.primary") }}
            <el-icon class="el-icon--right"><Right /></el-icon>
          </el-button>
          <el-button size="large" plain class="action-btn" @click="goBack">
            {{ t("overview.cta.secondary") }} 
          </el-button>
        </div>
      </el-col>
      
      <el-col :xs="24" :lg="13">
        <el-image 
          class="hero-main-image" 
          :src="publicPath('images/overview-hero.png')" 
          fit="cover"
        >
          <template #placeholder>
            <div class="image-slot">加载中<span class="dot">...</span></div>
          </template>
        </el-image>
      </el-col>
    </el-row>

    <div class="section-heading">
      <h2>核心架构解析</h2>
      <p>多维度、深层次的科学测评体系</p>
    </div>

    <el-row :gutter="30" class="feature-grid">
      <el-col
        v-for="(section, index) in overviewSections"
        :key="section.title"
        :xs="24" :md="12"
        class="feature-col"
      >
        <el-card class="feature-card" shadow="hover" :body-style="{ padding: '0px' }">
          <el-image 
            class="section-cover-image" 
            :src="getSectionImage(index)" 
            fit="cover"
          />
          
          <div class="feature-content">
            <h3>{{ section.title }}</h3>
            <p class="feature-desc">{{ section.description }}</p>
            <el-divider border-style="dashed" />
            <el-space direction="vertical" alignment="start" :size="12" class="highlight-list">
              <div
                v-for="(highlight, hIndex) in section.highlights"
                :key="hIndex"
                class="highlight-item"
              >
                <el-icon class="highlight-icon"><Check /></el-icon>
                <span>{{ highlight }}</span>
              </div>
            </el-space>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="timeline-wrapper" shadow="never">
      <el-row :gutter="40">
        <el-col :xs="24" :md="10" class="timeline-visual">
          <div class="timeline-header">
            <h2>{{ t("overview.cta.title") }}</h2>
            <p>{{ t("overview.cta.description") }}</p>
          </div>
          <el-image 
            class="timeline-side-image" 
            :src="publicPath('images/roadmap-side.png')" 
            fit="contain"
          />
        </el-col>
        
        <el-col :xs="24" :md="14" class="timeline-content">
          <el-timeline>
            <el-timeline-item
              v-for="(milestone, index) in overviewTimeline"
              :key="index"
              :type="milestone.type"
              :timestamp="milestone.title"
              size="large"
              placement="top"
            >
              <div class="timeline-desc">{{ milestone.description }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Check, Right } from "@element-plus/icons-vue";

const router = useRouter();
const { t, tm } = useI18n();

const baseUrl = import.meta.env.BASE_URL || '/'
const publicPath = (path) => `${baseUrl}${path.replace(/^\/+/, '')}`

const overviewSections = computed(() => tm("overview.sections") || []);
const overviewTimeline = computed(() => tm("overview.timeline") || []);

// 动态匹配图片逻辑
const getSectionImage = (index) => {
  const images = [
    publicPath('images/mbti-cover.png'),
    publicPath('images/eq-cover.png'),
    publicPath('images/learning-cover.png'),
    publicPath('images/big-five-cover.png')
  ];
  return images[index] || images[0];
};

const goBack = () => {
  router.push("/");
};

const goToTests = () => {
  router.push("/");
};
</script>

<style scoped>
.overview-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 6rem;
}

/* ================= 图片样式 ================= */
.hero-main-image {
  width: 100%;
  height: 450px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  background-color: #f8fafc; /* 图片加载前的底色 */
}

.section-cover-image {
  width: 100%;
  height: 240px;
  border-bottom: 1px solid #e2e8f0;
}

.timeline-side-image {
  width: 100%;
  height: 300px;
  margin-top: 2rem;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  color: #94a3b8;
}

/* ================= 布局样式保持专业性 ================= */
.hero-section { margin-bottom: 6rem; }
.tag-line { font-size: 0.8rem; font-weight: 700; color: #6366f1; letter-spacing: 1.5px; margin-bottom: 1rem; }
.hero-title { font-size: 2.8rem; font-weight: 800; color: #0f172a; margin-bottom: 1.2rem; }
.hero-subtitle { font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem; }

.section-heading { text-align: center; margin-bottom: 3.5rem; }
.section-heading h2 { font-size: 2rem; font-weight: 800; color: #0f172a; }

.feature-grid { margin-bottom: 5rem; }
.feature-card { border-radius: 16px; transition: transform 0.3s; }
.feature-card:hover { transform: translateY(-5px); }
.feature-content { padding: 2rem; }
.feature-content h3 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }

.highlight-item { display: flex; align-items: flex-start; gap: 0.8rem; font-size: 0.95rem; }
.highlight-icon { color: #10b981; margin-top: 2px; }

.timeline-wrapper { border-radius: 20px; background-color: #f8fafc; padding: 2rem; }
</style>