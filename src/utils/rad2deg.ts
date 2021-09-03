/**
 * @description 将弧度转换为角度
 * @param rad 弧度
 * @returns 角度
 */
 export default function rad2deg(rad: number): number {
    return (rad * 180.0) / Math.PI;
}