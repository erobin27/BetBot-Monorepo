import { ApiProperty } from "@nestjs/swagger";

export type AllLinksServiceResponse = string[];

export class AllLinksControllerResponse {
    @ApiProperty()
    message: 'COMPLETE';

    @ApiProperty({
        example: ['link1', 'link2'],
        isArray: true,
    })
    data: AllLinksServiceResponse;
}