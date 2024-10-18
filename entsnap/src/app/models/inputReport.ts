import { GpsGeocoder } from './gpsGeocoder';
import { ReportData, reportData } from './reportData';

export interface inputReport {
    id?: number;
    user_id?: number;
    type_id?: 1 | 2;
    report_data?: reportData | ReportData;
    gps_geocoder?: GpsGeocoder;
    image_ids?: number[];
    parent_report_id?: number;
}

export interface reportDraft extends inputReport {
    name?: string;
    draftImages?: [string?, string?, string?, string?]; // used for accessing draft report image filename
    imagePreview?: string;
}
