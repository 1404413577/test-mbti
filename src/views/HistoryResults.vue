<template>
  <div class="history-page">
    <nav class="history-nav">
      <button @click="$router.push('/')" class="nav-back">
        ← {{ $t("nav.back") }}
      </button>
      <h1 class="nav-title">Result History</h1>
      <div></div>
    </nav>

    <div class="container">
      <div v-if="groupedResults.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h2>No Results Yet</h2>
        <p>Complete a test to see your results history here.</p>
        <button @click="$router.push('/')" class="start-btn">Go to Tests</button>
      </div>

      <div v-else>
        <div v-for="group in groupedResults" :key="group.testType" class="test-group">
          <div class="group-header">
            <h2>{{ group.testTitle }}</h2>
            <span class="attempt-count">{{ group.items.length }} attempt{{ group.items.length > 1 ? 's' : '' }}</span>
          </div>

          <!-- Trend chart for multiple results -->
          <div v-if="group.items.length > 1 && group.dimensionKeys.length > 0" class="trend-section">
            <h3>Score Trends</h3>
            <div class="chart-container">
              <Line :data="group.chartData" :options="chartOptions" />
            </div>
          </div>

          <!-- Result list -->
          <div class="result-list">
            <div
              v-for="(item, idx) in group.items"
              :key="idx"
              class="result-item"
              @click="viewResult(item)"
            >
              <div class="result-meta">
                <span class="result-date">{{ formatDate(item.timestamp) }}</span>
                <span class="result-time">⏱ {{ formatTime(item.elapsedSeconds || 0) }}</span>
                <span class="result-questions">{{ item.questions?.length || 0 }} questions</span>
              </div>
              <div class="result-scores" v-if="item.dimensionScores">
                <span
                  v-for="(score, dim) in item.dimensionScores"
                  :key="dim"
                  class="score-tag"
                >{{ dim }}: {{ score }}</span>
              </div>
              <span class="result-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const router = useRouter();
const { t } = useI18n();

const results = ref([]);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const computeScores = (answers) => {
  const scores = {};
  for (const ans of answers) {
    if (!ans?.scoring) continue;
    for (const [dim, score] of Object.entries(ans.scoring)) {
      scores[dim] = (scores[dim] || 0) + score;
    }
  }
  return scores;
};

const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#a855f7",
];

const groupedResults = computed(() => {
  const groups = {};
  for (const r of results.value) {
    const key = r.testType;
    if (!groups[key]) {
      groups[key] = {
        testType: key,
        testTitle: r.testTitle || key,
        items: [],
      };
    }
    const dimensionScores = computeScores(r.answers || []);
    groups[key].items.push({
      ...r,
      dimensionScores: Object.keys(dimensionScores).length > 0 ? dimensionScores : null,
    });
  }

  return Object.values(groups).map((group) => {
    // Sort items by timestamp ascending
    group.items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Collect all dimension keys across all items
    const dimSet = new Set();
    for (const item of group.items) {
      if (item.dimensionScores) {
        Object.keys(item.dimensionScores).forEach((k) => dimSet.add(k));
      }
    }
    const dimensionKeys = [...dimSet];

    if (group.items.length > 1 && dimensionKeys.length > 0) {
      const labels = group.items.map((_, i) => `#${i + 1}`);
      const datasets = dimensionKeys.map((dim, i) => ({
        label: dim,
        data: group.items.map((item) => item.dimensionScores?.[dim] || 0),
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + "20",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }));

      group.chartData = { labels, datasets };
    }
    group.dimensionKeys = dimensionKeys;
    return group;
  });
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 16,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: "rgba(0,0,0,0.06)" },
    },
    x: {
      grid: { display: false },
    },
  },
};

const viewResult = (item) => {
  localStorage.setItem(`test_result_${item.testType}`, JSON.stringify(item));
  router.push(`/md-test/${item.testType}`);
};

onMounted(() => {
  try {
    const raw = localStorage.getItem("test_results_history");
    if (raw) {
      results.value = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load result history", e);
    results.value = [];
  }
});
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.history-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background: var(--color-surface);
  box-shadow: 0 2px 8px var(--color-card-shadow);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-back {
  background: var(--color-surface);
  border: 2px solid var(--color-primary-light);
  color: var(--color-primary);
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-back:hover {
  background: var(--color-primary);
  color: white;
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-heading);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: var(--color-text-heading);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.start-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.test-group {
  margin-bottom: 3rem;
  background: var(--color-surface);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.group-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-heading);
}

.attempt-count {
  font-size: 0.85rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.trend-section {
  margin-bottom: 2rem;
}

.trend-section h3 {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.chart-container {
  height: 280px;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-radius: 12px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 1rem;
}

.result-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  transform: translateX(4px);
}

.result-meta {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex-shrink: 0;
}

.result-date {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.result-time {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.result-questions {
  color: var(--color-text-sub);
  font-size: 0.8rem;
}

.result-scores {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-end;
}

.score-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.result-arrow {
  color: var(--color-text-sub);
  font-size: 1.1rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .history-nav {
    padding: 1rem;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-scores {
    justify-content: flex-start;
  }
}
</style>
