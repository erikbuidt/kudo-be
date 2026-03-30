import { Body, Controller, Post, HttpCode, HttpStatus, Get, UseGuards, Request, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './auth.dto'
import { Public } from '@/common/decorators/public.decorator'
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard'
import { Logger } from '@nestjs/common'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already in use' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT' })
  @ApiResponse({ status: 200, description: 'Returns JWT access_token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successfully' })
  logout() {
    return this.authService.logout()
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Redirects to Google for OAuth login' })
  googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Handles Google OAuth callback' })
  googleAuthRedirect(@Request() req: any, @Res() res: any) {
    const { access_token } = req.user
    const frontendUrl = process.env.FRONTEND_URL || 'https://kudo.coursity.io.vn'
    this.logger.log(`Google OAuth callback: ${frontendUrl}`)
    return res.redirect(`${frontendUrl}/auth/callback?access_token=${access_token}`)
  }
}
