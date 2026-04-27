// 推演节点存储服务 - 管理用户已有的推演节点

import { StoryNode } from './deductionService';

const STORAGE_KEY = 'mirror_deduction_nodes';

export interface StoredNode extends StoryNode {
  // 额外存储信息
  summary: string; // 节点摘要，用于快速展示
}

// 获取所有存储的节点
export function getStoredNodes(): StoredNode[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存节点
export function saveNode(node: StoryNode, summary: string): StoredNode {
  const nodes = getStoredNodes();
  const storedNode: StoredNode = {
    ...node,
    summary
  };
  nodes.push(storedNode);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  return storedNode;
}

// 查找特定时间点的节点
export function findNodesByTimePoint(timePoint: string): StoredNode[] {
  const nodes = getStoredNodes();
  return nodes.filter(n =>
    n.scenario.timePoint.includes(timePoint) ||
    timePoint.includes(n.scenario.timePoint.replace('年', ''))
  );
}

// 根据关键词搜索节点
export function searchNodes(keyword: string): StoredNode[] {
  const nodes = getStoredNodes();
  const lowerKeyword = keyword.toLowerCase();
  return nodes.filter(n =>
    n.scenario.title.includes(keyword) ||
    n.scenario.predicate.includes(keyword) ||
    n.summary.toLowerCase().includes(lowerKeyword)
  );
}

// 更新节点状态
export function updateNodeStatus(nodeId: string, status: StoryNode['status']): void {
  const nodes = getStoredNodes();
  const index = nodes.findIndex(n => n.id === nodeId);
  if (index !== -1) {
    nodes[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  }
}

// 删除节点
export function deleteNode(nodeId: string): void {
  const nodes = getStoredNodes();
  const filtered = nodes.filter(n => n.id !== nodeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// 清空所有节点（调试用）
export function clearAllNodes(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 生成节点摘要
export function generateNodeSummary(node: StoryNode): string {
  return `${node.scenario.timePoint} - ${node.scenario.title}`;
}