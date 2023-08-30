import { ComponentBase } from "../componentBase";
import { ViewComponent } from "./ViewComponent";

declare let UE;
const tempLookAtStart = new UE.Vector();
const tempLookAtEnd = new UE.Vector();
type tra = { val: number[], dirty: boolean };
class TransformComponent extends ComponentBase {
    private readonly _location: tra = { val: [0, 0, 0], dirty: false };
    public get location(): Type.Vector {
        return new Type.Vector(...this._location.val);
    }
    public set location(val: Type.Vector) {
        val = val || Type.Vector.zero;
        this._location.val = [val.x, val.y, val.z];
        this._location.dirty = true;
    }
    private readonly _rotation: tra = { val: [0, 0, 0], dirty: false };
    public get rotation(): Type.Rotation {
        return new Type.Rotation(this._rotation.val[0], this._rotation.val[1], this._rotation.val[2]);
    }
    public set rotation(val: Type.Rotation) {
        val = val || Type.Rotation.zero;
        this._rotation.val = [val.x, val.y, val.z];
        this._rotation.dirty = true;
    }
    private readonly _scale: tra = { val: [1, 1, 1], dirty: false };
    public get scale(): Type.Vector {
        return new Type.Vector(...this._scale.val);
    }
    public set scale(val: Type.Vector) {
        val = val || Type.Vector.one;
        this._scale.val = [val.x, val.y, val.z];
        this._scale.dirty = true;
    }

    private _tempForward: Type.Vector = Type.Vector.forward;
    public get forward(): Type.Vector {
        const view = this.owner.getComponent(ViewComponent);
        if (view && view.model) {
            const forward = view.model.forwardVector;
            return new Type.Vector(forward.x, forward.y, forward.z);
        }
        return this._tempForward;
    }


    onStart(pos?: Type.Vector, rotation?: Type.Rotation, scale?: Type.Vector): void {
        this._location.val = pos ? [pos.x, pos.y, pos.z] : [0, 0, 0];
        this._rotation.val = rotation ? [rotation.x, rotation.y, rotation.z] : [0, 0, 0];
        this._scale.val = scale ? [scale.x, scale.y, scale.z] : [1, 1, 1];
        this._location.dirty = true;
        this._rotation.dirty = true;
        this._scale.dirty = true;
    }

    protected onAdd(): void {
    }
    protected onRemove(): void {
        this._location.val = [0, 0, 0];
        this._rotation.val = [0, 0, 0];
        this._scale.val = [1, 1, 1];
    }
    protected onUpdate(dt: number): void {
        const view = this.owner.getComponent(ViewComponent);
        if (this._location.dirty) {
            this._location.dirty = false;
            view && view.model && (view.model.worldLocation = new Type.Vector(...this._location.val));
        }
        if (this._rotation.dirty) {
            this._rotation.dirty = false;
            view && view.model && (view.model.worldRotation = new Type.Rotation(this._rotation.val[0], this._rotation.val[1], this._rotation.val[2]));
        }
        if (this._scale.dirty) {
            this._scale.dirty = false;
            view && view.model && (view.model.worldScale = new Type.Vector(...this._scale.val));
        }
    }

    public lookAt(target: Type.Vector) {
        this.rotateTo(target, this._rotation);
        this._rotation.dirty = true;
        this._tempForward = target.subtract(this.location).normalize();
    }
    private rotateTo(location: Type.Vector, result: tra) {
        tempLookAtStart.Set(this._location.val[0], this._location.val[1], this._location.val[2]);
        tempLookAtEnd.Set(location.x, location.y, location.z);
        const rotation = UE.KismetMathLibrary.FindLookAtRotation(tempLookAtStart, tempLookAtEnd);
        result.val[0] = rotation.Roll;
        result.val[1] = rotation.Pitch;
        result.val[2] = rotation.Yaw;

        return new Type.Rotation(result.val[0], result.val[1], result.val[2]);
    }


}



declare let TransformComponentCtor;
globalThis.TransformComponentCtor = TransformComponent;