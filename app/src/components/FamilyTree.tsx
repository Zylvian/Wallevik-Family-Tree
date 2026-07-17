import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { Person, TreeNode } from '../types/person'
import { buildForest } from '../utils/treeBuilder'

interface FamilyTreeProps {
  people: Person[]
  selectedId: string | null
  onSelect: (person: Person) => void
}

type HierarchyPerson = Person & { children?: HierarchyPerson[] }

const NODE_RADIUS = 52
const LEVEL_HEIGHT = 160
const SIBLING_GAP = 40

function toNested(node: TreeNode): HierarchyPerson {
  const result: HierarchyPerson = { ...node.person }
  if (node.children.length > 0) {
    result.children = node.children.map(toNested)
  }
  return result
}

function toHierarchy(node: TreeNode): d3.HierarchyNode<HierarchyPerson> {
  return d3.hierarchy(toNested(node), (d) => d.children)
}

export function FamilyTree({ people, selectedId, onSelect }: FamilyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || people.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const forest = buildForest(people)
    if (forest.length === 0) return

    const treeLayout = d3
      .tree<HierarchyPerson>()
      .nodeSize([NODE_RADIUS * 2 + SIBLING_GAP, LEVEL_HEIGHT])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5))

    type LayoutNode = d3.HierarchyPointNode<HierarchyPerson>
    const allNodes: LayoutNode[] = []
    const allLinks: { source: LayoutNode; target: LayoutNode }[] = []

    let xOffset = 0

    for (const root of forest) {
      const layoutRoot = treeLayout(toHierarchy(root)) as LayoutNode
      const descendants = layoutRoot.descendants()
      const xExtent = d3.extent(descendants, (d) => d.x) as [number, number]
      const shift = xOffset - xExtent[0] + NODE_RADIUS * 2

      descendants.forEach((d) => {
        ;(d as LayoutNode).x += shift
        ;(d as LayoutNode).y += 80
      })

      allNodes.push(...descendants)
      allLinks.push(...(layoutRoot.links() as { source: LayoutNode; target: LayoutNode }[]))
      xOffset += xExtent[1] - xExtent[0] + NODE_RADIUS * 4 + 120
    }

    const totalWidth = xOffset
    const maxY = (d3.max(allNodes, (d) => d.y) ?? 0) + NODE_RADIUS * 2

    // Decorative tree trunks beneath each root subtree
    const trunkG = g.append('g').attr('class', 'tree-trunks')
    for (const root of forest) {
      const rootId = root.person.id
      const subtreeNodes = allNodes.filter((n) => belongsToSubtree(n, rootId))
      if (subtreeNodes.length === 0) continue

      const minX = d3.min(subtreeNodes, (d) => d.x) ?? 0
      const maxX = d3.max(subtreeNodes, (d) => d.x) ?? 0
      const centerX = (minX + maxX) / 2
      const trunkBottom = (d3.max(subtreeNodes, (d) => d.y) ?? 0) + NODE_RADIUS + 24

      trunkG
        .append('path')
        .attr('class', 'tree-trunk')
        .attr(
          'd',
          `M ${centerX - 20} ${trunkBottom}
           C ${centerX - 16} ${trunkBottom - 50}, ${centerX - 6} ${trunkBottom - 110}, ${centerX} ${trunkBottom - 150}
           C ${centerX + 6} ${trunkBottom - 110}, ${centerX + 16} ${trunkBottom - 50}, ${centerX + 20} ${trunkBottom} Z`
        )
    }

    g.selectAll('.branch')
      .data(allLinks)
      .join('path')
      .attr('class', 'branch')
      .attr('fill', 'none')
      .attr('d', (d) => {
        const sx = d.source.x
        const sy = d.source.y + NODE_RADIUS
        const tx = d.target.x
        const ty = d.target.y - NODE_RADIUS
        const midY = (sy + ty) / 2
        return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
      })

    const nodeG = g
      .selectAll<SVGGElement, LayoutNode>('.node')
      .data(allNodes, (d) => d.data.id)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => onSelect(d.data))

    nodeG
      .append('circle')
      .attr('class', 'node-bubble')
      .attr('r', NODE_RADIUS)
      .classed('selected', (d) => d.data.id === selectedId)

    nodeG
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .each(function (d) {
        const el = d3.select(this)
        const words = d.data.name.split(' ')
        const lines: string[] = []
        let current = ''
        for (const word of words) {
          const test = current ? `${current} ${word}` : word
          if (test.length > 14 && current) {
            lines.push(current)
            current = word
          } else {
            current = test
          }
        }
        if (current) lines.push(current)
        const display = lines.slice(0, 3)
        const startY = -((display.length - 1) * 7)
        display.forEach((line, i) => {
          el.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? startY : 14)
            .text(line)
        })
      })

    const initialScale = Math.min(
      (width - 40) / totalWidth,
      (height - 40) / maxY,
      1
    )
    const initialX = (width - totalWidth * initialScale) / 2
    const initialY = 20

    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
    )
  }, [people, selectedId, onSelect])

  if (people.length === 0) {
    return (
      <div className="tree-empty">
        <p>No family members yet. Use the editor to add people.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="tree-container">
      <svg ref={svgRef} className="tree-svg" />
      <div className="zoom-hint">Scroll to zoom · Drag to pan · Click a name for details</div>
    </div>
  )
}

function belongsToSubtree(node: d3.HierarchyPointNode<HierarchyPerson>, rootId: string): boolean {
  let current: d3.HierarchyPointNode<HierarchyPerson> | null = node
  while (current) {
    if (current.data.id === rootId) return true
    current = current.parent
  }
  return false
}
