import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import "./ArchitectureDiagram.css";


// ==========================================
// CUSTOM NODE
// ==========================================

function ArchitectureNode({
  data
}) {
  return (
    <div className="architecture-node">

      <Handle
        type="target"
        position={Position.Top}
      />

      <div className="architecture-node-icon">
        {data.icon}
      </div>

      <div className="architecture-node-content">

        <div className="architecture-node-title">
          {data.title}
        </div>

        <div className="architecture-node-subtitle">
          {data.subtitle}
        </div>

      </div>

      <Handle
        type="source"
        position={Position.Bottom}
      />

    </div>
  );
}


const nodeTypes = {
  architecture:
    ArchitectureNode
};


// ==========================================
// DIAGRAM
// ==========================================

function ArchitectureDiagram({
  graph
}) {

  if (
    !graph ||
    !graph.nodes ||
    graph.nodes.length === 0
  ) {
    return (
      <div className="architecture-empty">

        <p>
          No architecture relationships
          could be detected.
        </p>

      </div>
    );
  }


  // ==========================================
  // CREATE REACT FLOW NODES
  // ==========================================

  const columns = 3;

  const horizontalGap = 300;

  const verticalGap = 160;

  const nodes =
    graph.nodes.map(
      (node, index) => {

        const column =
          index % columns;

        const row =
          Math.floor(
            index / columns
          );

        return {

          id: node.id,

          type: "architecture",

          position: {
            x:
              column *
              horizontalGap,

            y:
              row *
              verticalGap
          },

          data: {
            icon:
              node.icon,

            title:
              node.label,

            subtitle:
              node.filePath
          }
        };
      }
    );


  // ==========================================
  // CREATE EDGES
  // ==========================================

  const edges =
    graph.edges.map(
      (edge) => ({
        id:
          edge.id,

        source:
          edge.source,

        target:
          edge.target,

        label:
          edge.label,

        animated:
          true
      })
    );


  return (
    <div className="architecture-diagram">
    <div className="architecture-legend">

  <span>
    <i className="legend-dot frontend-dot" />
    Frontend
  </span>

  <span>
    <i className="legend-dot backend-dot" />
    Backend
  </span>

  <span>
    <i className="legend-dot api-dot" />
    API
  </span>

  <span>
    <i className="legend-dot logic-dot" />
    Logic
  </span>

  <span>
    <i className="legend-dot ai-dot" />
    AI
  </span>

  <span>
    <i className="legend-dot data-dot" />
    Data
  </span>

</div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}

        fitView

        fitViewOptions={{
          padding: 0.25
        }}

        minZoom={0.25}

        maxZoom={1.5}

        nodesDraggable={true}

        nodesConnectable={false}

        elementsSelectable={true}
      >

        <Background
          gap={20}
          size={1}
        />

        <Controls
          showInteractive={false}
        />

        <MiniMap
          pannable
          zoomable
        />

      </ReactFlow>

    </div>
  );
}

export default ArchitectureDiagram;