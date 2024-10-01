import React, { useState, useCallback } from 'react';
import Tree from 'react-d3-tree';
import styles from '../styles/DialogueTree.module.css';

const DialogueTree = ({ dialogues }) => {
  const transformDialogues = (dialogue) => {
    const node = {
      name: dialogue.forkCode ? `Диалог ${dialogue.forkCode}` : 'Конец диалога',
      attributes: {},
      messages: dialogue.message,
      children: [],
    };

    if (dialogue.options) {
      dialogue.options.forEach((option) => {
        const childNode = {
          name: option.text,
          fullText: option.text,
          attributes: {},
          messages: [],
          children: [],
        };

        if (option.next) {
          childNode.children.push(transformDialogues(option.next));
        } else if (option.fork) {
          childNode.attributes.fork = `Переход к диалогу ${option.fork}`;
        }

        node.children.push(childNode);
      });
    }

    if (dialogue.fork) {
      node.attributes.fork = `Переход к диалогу ${dialogue.fork}`;
    }

    return node;
  };

  const treeData = transformDialogues(dialogues);

  const [tooltipData, setTooltipData] = useState(null);

  const renderCustomNode = useCallback(
    ({ nodeDatum, toggleNode, foreignObjectProps }) => {
      const nodeWidth = 180;
      const nodeHeight = 80;

      return (
        <g>
          <foreignObject
            width={nodeWidth}
            height={nodeHeight}
            x={-nodeWidth / 2}
            y={-nodeHeight / 2}
            {...foreignObjectProps}
          >
            <div
              className={styles.node}
              onMouseOver={(event) => {
                setTooltipData({
                  x: event.clientX,
                  y: event.clientY,
                  messages: nodeDatum.messages,
                  fullText: nodeDatum.fullText || nodeDatum.name,
                });
              }}
              onMouseOut={() => {
                setTooltipData(null);
              }}
            >
              <div className={styles.nodeText}>{nodeDatum.name}</div>
            </div>
          </foreignObject>
        </g>
      );
    },
    []
  );

  return (
    <div className={styles.treeContainer}>
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 600, y: 50 }}
        renderCustomNodeElement={renderCustomNode}
        zoomable={true}
        collapsible={false}
        separation={{ siblings: 2, nonSiblings: 2 }}
        nodeSize={{ x: 250, y: 200 }}
      />
      {tooltipData && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y + 10,
          }}
        >
          <p>
            <strong>{tooltipData.fullText}</strong>
          </p>
          {tooltipData.messages && tooltipData.messages.length > 0 && (
            <>
              <hr />
              {tooltipData.messages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DialogueTree;
