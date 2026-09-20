function Node(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.count = 0;

}
class Bst {
    constructor() {
        this.root = null;
    }
    create(val) {
        const newNode = new Node(val);
        if(this.root == null) {
            this.root = new Node(val);
            return this;
        } else {
            let current = this.root;

            const addSide = side => {
                if (!current[side]) {
                    current[side] = newNode;
                    return this;
                  };
                  current = current[side];
            };

            while (true) {
              if (val === current.val) {
                current.count++;
                return this;
              };
              if (val < current.val) addSide('left');
              else addSide('right');
            };
        }
    }
}

let inst = new Bst();
inst.create(1);
inst.create(2);
inst.create(7);
inst.create(9);
inst.create(4);
// inst.create(13);
// inst.create(30);
// inst.create(40);
// inst.create(50);
// inst.create(32);
console.log(inst);