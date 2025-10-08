import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      endpoint: this.configService.get<string>('STORAGE_ENDPOINT'),
      accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('STORAGE_SECRET_KEY'),
      s3ForcePathStyle: true,
    });
  }

  async generatePresignedUrl(key: string, contentType: string) {
    const params = {
      Bucket: this.configService.get<string>('STORAGE_BUCKET'),
      Key: key,
      ContentType: contentType,
      Expires: 3600, // 1 hour
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }

  async getFileUrl(key: string) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.configService.get<string>('STORAGE_BUCKET'),
      Key: key,
      Expires: 3600,
    });
  }

  async deleteFile(key: string) {
    return this.s3.deleteObject({
      Bucket: this.configService.get<string>('STORAGE_BUCKET'),
      Key: key,
    }).promise();
  }
}

