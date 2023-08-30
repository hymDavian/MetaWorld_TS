import { AssetsManager } from "../../../Tools/AssetsManager";
import { ComponentBase } from "../componentBase";

/**显示组件，用于场景上的模型显示 */
export class ViewComponent extends ComponentBase {
    private _model: Core.GameObject;
    public get model(): Core.GameObject {
        return this._model;
    }

    onStart(asset: string): void {
        this.changeModel(asset);

    }

    public changeModel(asset: string) {
        AssetsManager.ins.recover(this._model);
        AssetsManager.ins.spawn(asset).then((go) => {
            this._model = go;
            this._model.worldLocation = this.owner.transform.location;
            this._model.worldRotation = this.owner.transform.rotation;
            this._model.worldScale = this.owner.transform.scale;
        });
    }

    protected onAdd(): void {

    }
    protected onRemove(): void {
        AssetsManager.ins.recover(this._model);
        this._model = null;
    }
    protected onUpdate(dt: number): void {

    }

    protected onDisable(): void {
        if (this._model) {
            this._model.setVisibility(Type.PropertyStatus.Off);
        }
    }

    protected onEnable(): void {
        if (this._model) {
            this._model.setVisibility(Type.PropertyStatus.On);
        }
    }



}