import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { IsEmail, IsString, IsUrl, Length } from 'class-validator';
import {
    OnlineBusinessCreator,
    OnlineBusinessCreatorResultStatus,
} from 'src/modules/online-business/application';
import {
    OnlineBusinessName,
    OnlineBusinessWebsite,
} from 'src/modules/online-business/domain';
import { BusinessEmail } from 'src/modules/shared/domain';

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 75;

export class CreateOnlineBusinessBody {
    @IsString()
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    name: string;

    @IsUrl()
    website: string;

    @IsEmail()
    email: string;
}

@Controller('business/online')
export class CreateOnlineBusinessController {
    constructor(private onlineBusinessCreator: OnlineBusinessCreator) {}

    @Post()
    execute(@Body() body: CreateOnlineBusinessBody) {
        const result = this.onlineBusinessCreator.execute(
            new OnlineBusinessName(body.name),
            new OnlineBusinessWebsite(body.website),
            new BusinessEmail(body.email),
        );

        if (
            result.status ===
            OnlineBusinessCreatorResultStatus.BUSINESS_NAME_ALREADY_EXISTS
        ) {
            return new BadRequestException(
                `Business name ${body.name} already exists`,
            );
        }
    }
}