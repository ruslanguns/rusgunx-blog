import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';

export class QueryDTO {
    @Optional()
    @Transform(value => {
        value = Number(value);
        if (isNaN(value)) { return value = 0; }
        return value;
    })
    limit: number = 0;
}
