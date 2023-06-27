/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable lines-between-class-members */
type MoveTransform = { location: vec, direction: vec };
/**单位视野 */
export class UnitEye {
    public radius: number = 10;//视野半径
    public angle: number = 60;//视野角度
    private _transform: MoveTransform;//自身移动组件
    private _allFindTarget: MoveTransform[] = [];//所有待观察目标

    public constructor(transform: MoveTransform, radius: number, angle: number) {
        this._transform = transform;
        this.radius = radius;
        this.angle = angle;
    }

    /**射线检查函数 */
    public rayCastAction: (start: vec, end: vec) => boolean = null;
    /**获取场上所有障碍物的顶点信息集的方法 */
    public getAllObstacle: () => { center: vec, eulAngle: vec, size: [number, number, number] }[] = null;
    /**获取所有待观察目标的方法 */
    public getAllFindTarget: () => MoveTransform[] = null;
    /**观察条件 */
    public readonly lookConditions: ((target: MoveTransform) => boolean)[] = [];

    /**获取当前观察到的目标 */
    public getViewTargets(): MoveTransform[] {
        this._allFindTarget = this.getAllFindTarget();
        if (this._allFindTarget == null) { return []; }
        const ret: MoveTransform[] = [];
        const selfPosition = this._transform.location;//自身坐标
        const selfDirection = this._transform.direction;//自身朝向
        for (const object of this._allFindTarget) {
            if (this.lookConditions.every((value) => value(object))) {
                const objectPosition = object.location;//物体坐标
                const dirVec = subtract(selfPosition, objectPosition);//观察者的视线向量
                const distance = getlength(dirVec);//计算距离
                if (distance < this.radius) {
                    const objectDirection = getnormalized(dirVec);//计算方向
                    const angleBetween = getangle(selfDirection, objectDirection);//计算夹角


                    if (this.rayCastAction) {//有射线函数
                        const ray = this.rayCastAction?.(selfPosition, objectPosition);//射线检查是否被碰撞阻挡
                        if (angleBetween < this.angle / 2 && !ray) {//判断是否在视野内
                            ret.push(object);
                        }
                    }
                    else if (this.getAllObstacle) {//有障碍物变换信息函数
                        const objInfos = this.getAllObstacle?.();//获取障碍物的顶点信息集
                        const vertices = objInfos?.map((value) => {//获取障碍物的顶点信息
                            const center = value.center;
                            const eulAngle = value.eulAngle;
                            const size = value.size;
                            return getCubeVertices(center, eulAngle, size);
                        });
                        const seeWall = this.isObstacleBetween(selfPosition, objectPosition, vertices)
                        if (angleBetween < this.angle / 2 && !seeWall) {//判断是否在视野内
                            ret.push(object);
                        }
                    }
                    else {//无任何额外视野遮挡判断条件
                        if (angleBetween < this.angle / 2) {//判断是否在视野内
                            ret.push(object);
                        }
                    }

                }
            }
        }
        return ret;
    }

    /**让一段直线与所有障碍物进行相交判断，返回是否相交 */
    private isObstacleBetween(start: vec, end: vec, obstacle: vec[][]): boolean {
        if (obstacle == null || obstacle.length === 0) { return false; }
        for (const vertices of obstacle) {
            const intersect = this.intersect(start, end, vertices);
            if (intersect != null) {
                return true;
            }
        }
        return false;
    }


    /**判断一段直线是否与几何体相交,相交则返回交点 */
    private intersect(start: vec, end: vec, vertices: vec[]) {
        if (vertices == null || vertices.length < 2) { return null; }
        for (let i = 0; i < vertices.length; i++) {
            const start_point = vertices[i];
            const end_point = vertices[(i + 1) % vertices.length];
            const result = this.intersectSegmentWithLine(start, end, start_point, end_point);
            if (result != null) {
                return result;
            }
        }
        return null;
    }


    //判断一段线段和一条直线是否相交
    private intersectSegmentWithLine(start: vec, end: vec, line_start: vec, line_end: vec) {
        const direction = getnormalized(subtract(end, start));
        const normal = { x: -direction.y, y: direction.x, z: 0 };
        if (this.isParallel(normal, start, end)) {
            return null;
        }
        const intersect = this.intersectLineWithLine(normal, start, end, line_start, line_end);
        if (intersect == null) {
            return null;
        }
        if (this.isInSegment(intersect, line_start, line_end) && this.isInSegment(intersect, start, end)) {
            return intersect;
        }
        return null;
    }


    /**点是否在线段上 */
    private isInSegment(point: vec, start: vec, end: vec) {
        const vecToStart = subtract(point, start);
        const vecToEnd = subtract(point, end);
        const vecStartToEnd = subtract(end, start);
        return getlength(vecToStart) + getlength(vecToEnd) - getlength(vecStartToEnd) < 0.1;
        //(vecToStart.length + vecToEnd.length) - vecStartToEnd.length < 0.1;
    }

    /**判断是否平行 */
    private isParallel(normal: vec, line1Start: vec, line1End: vec) {
        const direction1 = subtract(line1End, line1Start);
        return Math.abs(vectorDot(normal, direction1)) < 0.000001;
    }

    /**计算两条直线的交点 */
    private intersectLineWithLine(normal: vec, line1Start: vec, line1End: vec, line2Start: vec, line2End: vec) {
        const n_dot_d = vectorDot(normal, subtract(line2End, line2Start));//计算两条直线的法向量与第二条直线的方向向量的点积
        if (Math.abs(n_dot_d) < 0.000001) {//两条直线平行
            return null;
        }
        const t = -1 * vectorDot(normal, subtract(line1Start, line2Start));
        //-normal.dot(subtract(line1Start, line2Start)) / n_dot_d;//计算交点在第二条直线上的位置
        if (t < 0 || t > 1) {//交点不在线段上
            return null;
        }
        //返回交点
        const ret = vecAdd(line2Start, vecMultiply(subtract(line2End, line2Start), t));
        return ret;
    }

}

interface vec {
    x: number,
    y: number,
    z: number,
}
function subtract(a: vec, b: vec): vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function getlength(v: vec) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function getnormalized(v: vec) {
    const length = getlength(v);
    return { x: v.x / length, y: v.y / length, z: v.z / length };
}
function getangle(a: vec, b: vec) {
    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    const a_length = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    const b_length = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
    return Math.acos(dot / (a_length * b_length));
}
function vectorDot(a: vec, b: vec) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function numberDot(a: number[], b: number[]) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}
function vecAdd(a: vec, b: vec) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function vecMultiply(a: vec, b: number) {
    return { x: a.x * b, y: a.y * b, z: a.z * b };
}
//矩阵乘法
function matrixDot(a: number[][], b: number[][]) {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

/**获取一个方块的8个顶点坐标 */
function getCubeVertices(center: vec, eulAngle: vec, size: [number, number, number]): vec[] {
    const rotation = [radian(eulAngle.x), radian(eulAngle.y), radian(eulAngle.z)];//将欧拉旋转转为弧度值
    const vertices: vec[] = [];
    for (let dz = -1; dz <= 1; dz++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const vertex = { x: dx * size[0] / 2, y: dy * size[1] / 2, z: dz * size[2] / 2 };
                vertices.push(vertex);
            }
        }
    }
    //将顶点坐标旋转到世界坐标系
    const world_vertices = vertices.map(vertex => {
        const rotated = rotationVector(vertex, rotation);
        return vecAdd(rotated, center);
    });
    return world_vertices;
}
/**定义旋转函数（绕任意轴旋转向量） */
function rotationVector(vector: vec, rotation: number[]) {
    const { x, y, z } = vector;
    const [rx, ry, rz] = rotation;

    //绕x轴旋转
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const rotated_x = x;
    const rotated_y = y * cosX - z * sinX;
    const rotated_z = y * sinX + z * cosX;

    //绕y轴旋转
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const rotated_x2 = rotated_x * cosY + rotated_z * sinY;
    const rotated_y2 = rotated_y;
    const rotated_z2 = -rotated_x * sinY + rotated_z * cosY;

    //绕z轴旋转
    const cosZ = Math.cos(rz);
    const sinZ = Math.sin(rz);
    const rotated_x3 = rotated_x2 * cosZ - rotated_y2 * sinZ;
    const rotated_y3 = rotated_x2 * sinZ + rotated_y2 * cosZ;
    const rotated_z3 = rotated_z2;

    return { x: rotated_x3, y: rotated_y3, z: rotated_z3 };
}
/**欧拉角转弧度 */
function radian(angle: number) {
    return angle / 180 * Math.PI;
}
