<template>
  <div class="home-wrapper">
    <ParticleBackground />

    <div class="main-container">
      <el-row :gutter="40" align="middle" class="hero-section">
        <el-col :xs="24" :lg="12" class="hero-content">
          <div class="pro-badge">PRO ASSESSMENT SYSTEM</div>
          <h1 class="hero-title">{{ t("app.title") }}</h1>
          <p class="hero-subtitle">{{ t("app.subtitle") }}</p>

          <div class="hero-actions">
            <el-button
              type="primary"
              size="large"
              class="main-btn"
              @click="goToIntro"
            >
              {{ t("home.startNow") }}
              <el-icon class="el-icon--right"><Right /></el-icon>
            </el-button>
            <el-button
              size="large"
              plain
              class="secondary-btn"
              @click="goToOverview"
            >
              {{ t("home.learnMore") }}
            </el-button>
          </div>

          <el-row class="hero-stats" :gutter="20">
            <el-col :span="8" v-for="stat in heroStats" :key="stat.id">
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </el-col>
          </el-row>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="hero-image-placeholder">
            <el-image
              :src="heroIllustration"
              fit="cover"
              class="hero-image parallax-image"
              loading="lazy"
            />
          </div>
        </el-col>
      </el-row>

      <div class="section-header">
        <h2>核心测评体系</h2>
        <span class="section-en">CORE ASSESSMENTS</span>
      </div>

      <el-row :gutter="24" class="test-grid">
        <el-col
          v-for="test in tests"
          :key="test.id"
          :xs="24"
          :sm="12"
          :lg="6"
          class="grid-item"
        >
          <el-card
            shadow="hover"
            class="test-card"
            :body-style="{ padding: '0px' }"
            @click="navigateToTest(test.route)"
          >
            <div class="card-image-wrapper">
              <el-image
                class="test-card-image"
                :src="getCardImage(test)"
                fit="cover"
              >
                <template #placeholder>
                  <div class="image-slot">加载中...</div>
                </template>
                <template #error>
                  <div class="image-slot">暂无图片</div>
                </template>
              </el-image>
              <div v-if="test.featured" class="featured-tag">推荐测评</div>
            </div>

            <div class="card-body">
              <h3 class="test-title">{{ test.title }}</h3>
              <p class="test-description">{{ test.description }}</p>

              <el-divider border-style="dashed" class="card-divider" />

              <div class="test-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ test.duration }}
                </span>
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ test.questionsLabel }}
                </span>
                <span class="meta-item">
                  <el-icon><Aim /></el-icon>
                  {{ test.accuracyLabel }}
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const baseUrl = import.meta.env.BASE_URL || "/";
const publicPath = (path) => `${baseUrl}${path.replace(/^\/+/, "")}`;
// 引入专业的 Element Plus 图标替代 Emoji
import { Clock, Document, Aim, Right } from "@element-plus/icons-vue";
import ParticleBackground from "@/components/ParticleBackground.vue";

const router = useRouter();
const { t, tm, locale } = useI18n();

import heroIllustration from "@/assets/brain.png";

const dynamicCounts = ref({});

// 移除了原来的 emoji icon
const testMeta = {
  mbti: {
    id: "mbti-md",
    route: "/md-test/mbti",
    filePath: "/mbti-questions.md",
    imageKey: "mbti",
  },
  eq: {
    id: "eq-md",
    route: "/md-test/eq",
    filePath: "/eq-questions.md",
    imageKey: "eq",
  },
  learningStyle: {
    id: "learning-style-md",
    route: "/md-test/learning-style",
    filePath: "/learning-style-questions.md",
    imageKey: "learning",
  },
  bigFive: {
    id: "big-five-md",
    route: "/md-test/big-five",
    filePath: "/big-five-questions.md",
    imageKey: "big-five",
  },
  holland: {
    id: "holland-md",
    route: "/md-test/holland-riasec",
    filePath: "/holland-riasec-questions.md",
    imageKey: "holland",
  },
  enneagramQuestions: {
    id: "enneagram-md",
    route: "/md-test/enneagram",
    filePath: "/enneagram-questions.md",
    imageKey: "enneagram",
  },
  disc: {
    id: "disc-md",
    route: "/md-test/disc",
    filePath: "/disc-questions.md",
    imageKey: "disc",
    imageExt: "svg",
  },
  resilience: {
    id: "resilience-md",
    route: "/md-test/resilience",
    filePath: "/resilience-questions.md",
    imageKey: "resilience",
    imageExt: "svg",
  },
};

const defaultTestsData = {
  mbti: { featured: true, duration: "15-20分钟", accuracyLabel: "95% 信度" },
  eq: { featured: true, duration: "15-20分钟", accuracyLabel: "92% 信度" },
  learningStyle: {
    featured: false,
    duration: "15-20分钟",
    accuracyLabel: "90% 信度",
  },
  bigFive: {
    featured: false,
    duration: "10-15分钟",
    accuracyLabel: "93% 信度",
  },
  holland: {
    featured: false,
    duration: "10-15分钟",
    accuracyLabel: "93% 信度",
  },
  enneagramQuestions: {
    featured: false,
    duration: "10-15分钟",
    accuracyLabel: "93% 信度",
  },
  disc: {
    featured: false,
    duration: "10-15分钟",
    accuracyLabel: "94% 信度",
  },
  resilience: {
    featured: false,
    duration: "8-12分钟",
    accuracyLabel: "91% 信度",
  },
};

const updateQuestionCounts = async () => {
  for (const [key, meta] of Object.entries(testMeta)) {
    try {
      const currentLang = locale.value || "zh-CN";
      const path = publicPath(`/md/${currentLang}${meta.filePath}`);
      const response = await fetch(path);
      if (response.ok) {
        const text = await response.text();
        const count = (text.match(/^### /gm) || []).length;
        if (count > 0) dynamicCounts.value[key] = count;
      }
    } catch (e) {
      console.error(`Failed to load count for ${key}`, e);
    }
  }
};

const tests = computed(() => {
  const localized = tm("home.testsData") || {};
  return Object.entries(testMeta).map(([key, meta]) => {
    const data = localized[key] || {};
    const fallback = defaultTestsData[key] || {};
    const count = dynamicCounts.value[key];

    return {
      ...meta,
      title: data.title || t(`testTitles.${key}`),
      description: data.description || "",
      duration: data.duration || fallback.duration,
      questionsLabel: count ? `${count} 题` : "-- 题",
      accuracyLabel: data.accuracyLabel || fallback.accuracyLabel,
      featured: data.featured ?? fallback.featured,
    };
  });
});

const heroStats = computed(() => {
  const stats = tm("home.stats") || {};
  return [
    { id: "tests", number: Object.keys(testMeta).length, label: "专业量表" },
    { id: "users", number: "10万+", label: "累计测评" },
    { id: "accuracy", number: "95%", label: "综合信效度" },
  ];
});

onMounted(updateQuestionCounts);

const getCardImage = (test) => {
  const imageKey = test.imageKey || test.id.split('-')[0];
  const ext = test.imageExt || 'png';
  return publicPath(`images/${imageKey}-card.${ext}`);
};

const navigateToTest = (route) => router.push(route);
const goToIntro = () => router.push("/test-intro");
const goToOverview = () => router.push("/test-overview");
</script>

<style scoped>
.home-wrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

/* ================= Hero Section ================= */
.hero-section {
  margin-bottom: 6rem;
}

.hero-content {
  padding-right: 2rem;
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
  font-size: 3rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-top: 0;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 90%;
}

.hero-actions {
  margin-bottom: 3.5rem;
  display: flex;
  gap: 1rem;
}

.main-btn {
  padding: 0 2rem;
  font-weight: 600;
  font-size: 1rem;
}

.secondary-btn {
  padding: 0 2rem;
  font-weight: 600;
  color: #475569;
  border-color: #cbd5e1;
}

.hero-stats {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Hero 占位图 */
.hero-image-placeholder {
  width: 100%;
  height: 420px;
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.hero-image-placeholder:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder-text {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.placeholder-subtext {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* ================= 核心测评区域 ================= */
.section-header {
  margin-bottom: 3rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.section-en {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 1px;
}

.grid-item {
  margin-bottom: 1.5rem;
}

.test-card {
  cursor: pointer;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.test-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1) !important;
  border-color: #cbd5e1;
}

/* 卡片封面占位符 */
.card-cover-placeholder {
  height: 160px;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid #e2e8f0;
}

.cover-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
}

.cover-subtext {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-top: 0.25rem;
}

.featured-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* 卡片内容 */
.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.test-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.test-description {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-divider {
  margin: 1.25rem 0;
}

.test-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.meta-item .el-icon {
  font-size: 1rem;
  color: #94a3b8;
}

/* ================= 响应式 ================= */
@media (max-width: 992px) {
  .hero-content {
    padding-right: 0;
    margin-bottom: 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 2rem 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .main-btn,
  .secondary-btn {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* 图片包装层，锁定高度并处理标签定位 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px; /* 固定卡片图片高度 */
  overflow: hidden;
  border-bottom: 1px solid #f1f5f9;
}

.test-card-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

/* 悬停时图片轻微放大效果，增加专业感 */
.test-card:hover .test-card-image {
  transform: scale(1.08);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* 推荐标签定位 */
.featured-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
</style>
