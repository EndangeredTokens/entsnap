import { Comment } from './comment';
import { GpsGeocoder } from './gpsGeocoder';
import { ReportData, reportData } from './reportData';

export enum ReportImage {
    FRONTAL_IMAGE = 'frontal_image',
    LEAF_IMAGE = 'leaf_image',
    TRUNK_IMAGE = 'trunk_image',
    SCALE_IMAGE = 'scale_image',
}

export interface ReportV3 {
    id?: number;
    user_id?: number;
    type_id?: number;
    report_data?: reportData;
    gps_geocoder?: GpsGeocoder;
    image_ids?: number[];
}

export interface Report {
    id?: number;
    user_id: number;
    acot_validation: number;
    conaf_validation: number;
    type: number;
    user_name: string;
    user_avatar: string;
    short_description: string;
    description: string;
    date?: Date;
    latitude: number;
    longitude: number;
    address_type: number;
    address: string;
    street_number: string;
    street_name: string;
    city: string;
    province: string;
    county: string;
    country: string;
    map: string;
    frontal_image: string;
    leaf_image: string;
    trunk_image: string;
    scale_image: string;
    stage_id: number;
    foliage_id: number;
    tree_type: string;
    trunk_diameter: number;
    surrounding_desc: string;
    poem: string;
    completed: boolean;
    validated: boolean;
    minted: boolean;
    endangered: boolean;
    hidden: boolean;
    comments: Comment[];
    is_draft: boolean;
    report_id: number;
    images?: any[];
    foliage?: any;
    stage?: any;
    type_id?: number;
    gps_geocoder?: GpsGeocoder;
    data?: reportData;
}

export interface Report2 {
    id?: number;
    user_id: number;
    latitude: number;
    longitude: number;
    stage: number;
    foliage: number;
    is_validated: number;
}

export interface ProofOfLife {
    id?: number;
    UserId: number;
    date?: Date;
    latitude: number;
    longitude: number;
    address_type: number;
    address: string;
    street_number: string;
    street_name: string;
    city: string;
    province: string;
    county: string;
    country: string;
    map: string;
    frontal_image: string;
    leaf_image: string;
    trunk_image: string;
    scale_image: string;
    validated: boolean;
}
