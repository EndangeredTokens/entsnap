export interface reportData {
    poem?: string; // To be deprecated
    foliage_id?: number; // To be deprecated
    tree_type?: string; // To be deprecated
    trunk_diameter?: number; // To be deprecated

    // To be functional
    stage_id?: number;
    ecosystem_surrounding_id?: number;
    environment_exposition_id?: number;
    common_name?: string;
    specie?: string;
    family?: string;
    genus?: string;
    exampleImageCitation?: string;
    ai_specie?: string;
}

export interface ReportData {
    stage_id?: number;
    ecosystem_surrounding_id?: number;
    environment_exposition_id?: number;
    specie?: string;
    common_name?: string | null;
    family?: string;
    genus?: string;
    exampleImageCitation?: string;
    ai_specie?: string;
    tree_type?: string;
}
