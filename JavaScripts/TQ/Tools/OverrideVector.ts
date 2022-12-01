Type.Vector.prototype["add2"] = Type.Vector.prototype["add"];
Type.Vector.prototype["add"] = function (other: Type.Vector) {
    return this.clone().add2(other);
}
Type.Vector.prototype["subtract2"] = Type.Vector.prototype["subtract"];
Type.Vector.prototype["subtract"] = function (other: Type.Vector) {
    return this.clone().subtract2(other);
}
Type.Vector.prototype["multiply2"] = Type.Vector.prototype["multiply"];
Type.Vector.prototype["multiply"] = function (other: Type.Vector | number) {
    return this.clone().multiply2(other);
}
Type.Vector.prototype["divide2"] = Type.Vector.prototype["divide"];
Type.Vector.prototype["divide"] = function (other: Type.Vector | number) {
    return this.clone().divide2(other);
}