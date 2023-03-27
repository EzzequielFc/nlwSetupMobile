export function generateProgressPorcentage(total: number, completed: number) {
  return Math.round((total / total) * 100);
}
