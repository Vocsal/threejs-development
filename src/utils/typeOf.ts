export default function typeOf(val: any): string {
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}