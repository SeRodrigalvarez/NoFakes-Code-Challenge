import { randomUUID } from 'crypto';
import { IsUUID, validateSync } from 'class-validator';

export class BusinessId {
    @IsUUID()
    private id: string;

    private constructor(uuid: string) {
        this.id = uuid;
    }

    static createId() {
        return new this(randomUUID());
    }

    static createIdFrom(uuid: string) {
        const object = new this(uuid);
        const result = validateSync(object);
        if (result.length != 0) {
            throw new Error(
                `Invalid business id: ${uuid}. Id must be a valid UUID`,
            );
        }
        return object;
    }

    get value() {
        return this.id;
    }

    equals(id: BusinessId) {
        return this.id === id.value;
    }
}