import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPersonalized(@Request() req: any, @Query('limit') limit: number) {
    return this.recommendationsService.getPersonalized(req.user.userId, limit || 8);
  }

  @Get('popular')
  async getPopular(@Query('limit') limit: number) {
    return this.recommendationsService.getPopular(limit || 8);
  }
}
