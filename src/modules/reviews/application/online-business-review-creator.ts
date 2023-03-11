import { Inject, Injectable } from '@nestjs/common';
import {
    OnlineBusinessRepository,
    ONLINE_BUSINESS_PORT,
} from 'src/modules/online-business/domain';
import { Id } from 'src/modules/shared/domain';
import {
    CreateResultStatus,
    Review,
    ReviewRating,
    ReviewRepository,
    ReviewText,
    REVIEW_REPOSITORY_PORT,
    Username,
} from '../domain';
import { GetResultStatus } from 'src/modules/online-business/domain';

export interface OnlineBusinessReviewCreatorResult {
    status: OnlineBusinessReviewCreatorResultStatus;
    id?: string;
}

export enum OnlineBusinessReviewCreatorResultStatus {
    OK,
    NON_EXISTANT_BUSINESS_ID,
    DUPLICATED_REVIEW,
    GENERIC_ERROR,
}

@Injectable()
export class OnlineBusinessReviewCreator {
    constructor(
        @Inject(REVIEW_REPOSITORY_PORT)
        private reviewRepository: ReviewRepository,
        @Inject(ONLINE_BUSINESS_PORT)
        private onlineBusinessRepository: OnlineBusinessRepository,
    ) {}

    async execute(
        businessId: Id,
        text: ReviewText,
        rating: ReviewRating,
        username: Username,
    ): Promise<OnlineBusinessReviewCreatorResult> {
        const getResult = await this.onlineBusinessRepository.getById(
            businessId,
        );
        if (getResult.status === GetResultStatus.GENERIC_ERROR) {
            return {
                status: OnlineBusinessReviewCreatorResultStatus.GENERIC_ERROR,
            };
        }
        if (getResult.status === GetResultStatus.NOT_FOUND) {
            return {
                status: OnlineBusinessReviewCreatorResultStatus.NON_EXISTANT_BUSINESS_ID,
            };
        }
        const review = new Review(businessId, text, rating, username);
        const createResult = await this.reviewRepository.create(review);
        if (createResult.status === CreateResultStatus.DUPLICATED_REVIEW) {
            return {
                status: OnlineBusinessReviewCreatorResultStatus.DUPLICATED_REVIEW,
            };
        }
        if (createResult.status === CreateResultStatus.GENERIC_ERROR) {
            return {
                status: OnlineBusinessReviewCreatorResultStatus.GENERIC_ERROR,
            };
        }
        this.onlineBusinessRepository.increaseReviewAmount(businessId);
        return {
            status: OnlineBusinessReviewCreatorResultStatus.OK,
            id: review.id,
        };
    }
}
