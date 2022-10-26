export interface Class<T> extends Function {
    new(...args: any[]): T;
}

export class Tools {
    public static sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}

