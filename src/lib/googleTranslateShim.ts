/**
 * React + Translation Engine DOM Safety Shim
 * 
 * When browser-level dynamic translation engines (such as Google Translate)
 * wrap text nodes in <font> tags, React's reconciler can throw
 * "NotFoundError: The node to be removed is not a child of this node"
 * when unmounting or re-rendering components.
 * 
 * This shim intercepts removeChild and insertBefore calls to safely handle
 * modified DOM hierarchies without breaking React's component tree.
 */

export function setupTranslationDOMShim(): void {
  if (typeof window === 'undefined' || typeof Node === 'undefined' || !Node.prototype) {
    return;
  }

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}
