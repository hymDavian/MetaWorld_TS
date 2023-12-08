declare namespace mw {
    interface ILocalPlayer {
        position: mw.Vector,
        rotation: mw.Rotation,
        character: mw.Character,
        playerId: number,
        worldTransform: mw.Transform
    }
    export let localPlayer: ILocalPlayer;

    interface Vector {
        /**不修改自身的情况下增加向量值，返回新向量 */
        addNew: (v: mw.Vector) => mw.Vector
    }


}

class LocalPlayer implements mw.ILocalPlayer {
    get position(): mw.Vector {
        return mw.Player.localPlayer.character.worldTransform.position;
    }
    set position(v: mw.Vector) {
        mw.Player.localPlayer.character.worldTransform.position = v;
    }
    get rotation(): mw.Rotation {
        return mw.Player.localPlayer.character.worldTransform.rotation;
    }
    set rotation(v: mw.Rotation) {
        mw.Player.localPlayer.character.worldTransform.rotation = v;
    }

    get character() {
        return mw.Player.localPlayer.character;
    }
    get playerId(): number {
        return mw.Player.localPlayer.playerId;
    }
    get worldTransform(): mw.Transform {
        return mw.Player.localPlayer.character.worldTransform
    }
}
mw.localPlayer = new LocalPlayer();

if (!mw.Vector.prototype.addNew) {
    Object.defineProperty(mw.Vector.prototype, "addNew", {
        value(v: { x: number; y: number; z: number; }) {
            if (v == null) { return mw.Vector.zero; }
            const x = this.x || 0 + v.x || 0;
            const y = this.y || 0 + v.y || 0;
            const z = this.z || 0 + v.z || 0;
            return new mw.Vector(x, y, z);
        },
        enumerable: false
    });
}



