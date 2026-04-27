import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { useWorldlineStore, useUIStore } from '@/stores'

const viewModes = [
  { id: 'timeline' as const, label: '时间线', icon: '—' },
  { id: 'parallel' as const, label: '平行世界', icon: '∥' },
  { id: 'regret' as const, label: '遗憾视角', icon: '?' },
]

const filterOptions = [
  { id: 'all' as const, label: '全部' },
  { id: '决定' as const, label: '决定' },
  { id: '事件' as const, label: '事件' },
  { id: '转折' as const, label: '转折' },
  { id: '差点发生' as const, label: '差点发生' },
  { id: '遗憾' as const, label: '遗憾' },
  { id: '推演' as const, label: '推演' },
]

export function WorldlinePage() {
  const { nodes, currentNodeId, viewMode, filter, setCurrentNode, setViewMode, setFilter } = useWorldlineStore()
  const { setPhase } = useUIStore()
  const [selectedNode, setSelectedNode] = useState<typeof nodes[0] | null>(null)

  const filteredNodes = filter === 'all' ? nodes : nodes.filter((n) => n.type === filter)

  const handleNodeClick = (node: typeof nodes[0]) => {
    setSelectedNode(node)
    setCurrentNode(node.id)
  }

  return (
    <div className="min-h-screen bg-bg-black pt-16 pb-20 md:pb-8 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="py-6">
          <h1 className="text-2xl font-medium text-text-white mb-2">世界线</h1>
          <p className="text-text-gray">你人生中的关键节点和可能的分支</p>
        </header>

        {/* View mode toggle */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                viewMode === mode.id
                  ? 'bg-gold text-bg-black'
                  : 'bg-bg-medium text-text-gray hover:bg-bg-light'
              }`}
            >
              <span>{mode.icon}</span>
              <span className="text-sm">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === option.id
                  ? 'bg-gold/20 text-gold'
                  : 'bg-bg-medium text-text-gray hover:bg-bg-light'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Timeline view */}
        {viewMode === 'timeline' && (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-bg-medium" />

            {/* Nodes */}
            <div className="space-y-4">
              {filteredNodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-10"
                >
                  {/* Node dot */}
                  <div
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-bg-black"
                    style={{ backgroundColor: node.color }}
                  />

                  <Card
                    hover
                    className={`p-4 cursor-pointer ${
                      selectedNode?.id === node.id ? 'border-gold' : ''
                    }`}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs mb-2"
                          style={{ backgroundColor: `${node.color}33`, color: node.color }}
                        >
                          {node.type}
                        </span>
                        <h3 className="text-lg font-medium text-text-white">{node.title}</h3>
                        <p className="text-sm text-text-gray mt-1">{node.description}</p>
                      </div>
                      <span className="text-xs text-text-dark">{node.date}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Parallel view */}
        {viewMode === 'parallel' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className={`p-4 cursor-pointer h-full ${
                    selectedNode?.id === node.id ? 'border-gold' : ''
                  }`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div
                    className="w-2 h-2 rounded-full mb-2"
                    style={{ backgroundColor: node.color }}
                  />
                  <h3 className="text-sm font-medium text-text-white mb-1">{node.title}</h3>
                  <p className="text-xs text-text-dark">{node.date}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Regret view */}
        {viewMode === 'regret' && (
          <div className="space-y-4">
            {filteredNodes
              .filter((n) => n.type === '遗憾' || n.type === '差点发生')
              .map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="glass"
                    className="p-4 border-l-2"
                    style={{ borderLeftColor: node.color }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-text-dark">{node.type}</span>
                        <h3 className="text-lg font-medium text-text-white mt-1">{node.title}</h3>
                        <p className="text-sm text-text-gray mt-1">{node.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        推演 →
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        )}

        {/* Selected node detail */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 md:bottom-8 left-6 right-6 z-40"
          >
            <Card variant="glass" className="p-5 max-w-2xl mx-auto">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: `${selectedNode.color}33`, color: selectedNode.color }}
                    >
                      {selectedNode.type}
                    </span>
                    <span className="text-xs text-text-dark">{selectedNode.date}</span>
                  </div>
                  <h3 className="text-xl font-medium text-text-white">{selectedNode.title}</h3>
                  <p className="text-text-gray mt-1">{selectedNode.description}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-text-dark hover:text-text-gray ml-4"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" size="sm" onClick={() => setSelectedNode(null)}>
                  关闭
                </Button>
                <Button size="sm">推演这个节点</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}