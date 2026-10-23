<script setup>
import { computed } from 'vue';
import { STATUS_MAP } from '@/stores/orderStore';

const props = defineProps({
  status: {
    type: String,
    required: true,
    default: 'pending'
  },
  size: {
    type: String,
    default: 'sm' // 'xs' | 'sm' | 'md'
  },
  showDot: {
    type: Boolean,
    default: true
  }
});

const config = computed(() => {
  return STATUS_MAP[props.status] || {
    label: props.status,
    key: props.status,
    badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-300'
  };
});

const dotColor = computed(() => {
  switch (props.status) {
    case 'pending': return 'bg-neutral-400';
    case 'approved': return 'bg-sky-500';
    case 'ordered': return 'bg-amber-500';
    case 'delivered': return 'bg-emerald-500';
    case 'rejected': return 'bg-rose-500';
    default: return 'bg-neutral-400';
  }
});

const sizeClasses = computed(() => {
  if (props.size === 'xs') return 'text-[11px] px-2 py-0.5 gap-1.5 font-mono';
  if (props.size === 'md') return 'text-xs px-3 py-1 gap-2 font-mono';
  return 'text-xs px-2.5 py-0.5 gap-1.5 font-mono';
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium border rounded-full transition-colors tabular-nums',
      config.badgeClass,
      sizeClasses
    ]"
  >
    <span
      v-if="showDot"
      :class="['w-1.5 h-1.5 rounded-full shrink-0', dotColor]"
      aria-hidden="true"
    />
    <span>{{ config.label }}</span>
  </span>
</template>
