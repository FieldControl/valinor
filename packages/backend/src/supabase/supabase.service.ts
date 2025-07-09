import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.error('Supabase URL and Service Role Key must be provided');
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase client initialized successfully');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper method for authenticated operations
  getAuthenticatedClient(accessToken?: string): SupabaseClient {
    if (accessToken) {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
      
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    }
    
    return this.supabase;
  }
} 