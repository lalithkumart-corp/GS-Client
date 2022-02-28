function Node(val) {
    this.val = val;
    this.next = null;
}

function LinkedList() {
    this.root = null;
    this.insert = (val) => {
        let newNode = new Node(val);
        if(!this.root) this.root = newNode;
        else this.insertToNode(this.root, newNode);
    };
    this.insertToNode_recursive = (node, newNode) => {
        while(node.next) {
            this.insertToNode(node.next, newNode)
            break;
        }
        if(!node.next) node.next = newNode;
    }
    this.insertToNode = (node, newNode) => {
        let current = node;
        while(current.next) {
            current = current.next;
        }
        current.next = newNode;
    }
    this.reverse_LalithWay = () => {
        let carrierNode = JSON.parse(JSON.stringify(this.root));
        carrierNode.next = null;
        let reversedNode = _reverse_LalithWay(this.root.next, carrierNode);
    }
    const _reverse_LalithWay = (node, carriedNode) => {
        if(node.next) {
            let n = JSON.parse(JSON.stringify(node));
            n.next = null;
            _reverse_LalithWay(node.next, n);
        }
        let current = node;
        while(node.next) {
            current = node.next;
        }
        current.next = carriedNode;
        return node;
    }

    this.reverse = () => {
        let curr = this.root;
        let next = null;
        let prev = null;
        while(curr) {
            next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;   
        }
        this.root = prev;
    }
}

let lk = new LinkedList();
lk.insert(1);
lk.insert(2);
lk.insert(3);
lk.insert(4);