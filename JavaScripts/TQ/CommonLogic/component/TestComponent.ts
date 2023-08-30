import { ComponentBase, Entity } from "./componentBase";

class TestComponent extends ComponentBase {
    protected onAdd(): void {
        console.log(this.owner.uid + "添加测试组件成功");
    }
    protected onRemove(): void {
        console.log(this.owner.uid + "移除了测试组件");
    }
    protected onUpdate(dt: number): void {
        console.log(this.owner.uid + "的测试组件更新中！");
    }

    onStart(a: string, b: boolean, c: number, d: { dd: number[] }): void {
        console.log(this.owner.uid + "开始运行测试组件,参数：", a, b, c, d);
    }

    protected onEnable(): void {
        console.log(this.owner.uid + "打开了测试组件");
    }

    protected onDisable(): void {
        console.log(this.owner.uid + "关闭了测试组件");
    }

    public test() {
        console.log("这是测试组件的自定义函数111111");
    }
}

// const obj = Entity.getNewEntity();
// obj.addComponent(TestComponent, "123", false, 456, { dd: [789] })

// obj.getComponent(TestComponent).test();

// setInterval(() => {
//     ComponentBase.update(1);
// }, 500);

// setTimeout(() => {
//     obj.getComponent(TestComponent).setEnable(false);
// }, 5000);

// setTimeout(() => {
//     obj.getComponent(TestComponent).setEnable(true);
// }, 7000);

// setTimeout(() => {
//     obj.destory();
// }, 9000);
