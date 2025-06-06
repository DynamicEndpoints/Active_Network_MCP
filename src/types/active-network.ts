export interface SearchParams {
  // Search and query parameters
  query?: string;
  
  // Location parameters (use one of these)
  near?: string;
  lat_lon?: string;
  bbox?: string;
  geo_points?: string;
  
  // Geographic filters
  radius?: number;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  show_distance?: boolean;
  
  // Category and topic filters
  category?: string;
  category_name?: string;
  topic?: string;
  topic_name?: string;
  meta_interest?: string;
  meta_interest_name?: string;
  
  // Date filters
  start_date?: string;
  end_date?: string;
  
  // Special filters
  kids?: boolean | string;
  exclude_children?: boolean | string;
  include_evergreen_children?: boolean;
  registerable_only?: boolean;
  
  // Advanced filters
  attributes?: string;
  tags?: string;
  exists?: string;
  not_exists?: string;
  
  // Asset-specific searches
  asset_name?: string;
  org_id?: string;
  place_id?: string;
  source_system_id?: string;
  source_system_name?: string;
  
  // Pagination and sorting
  current_page?: number;
  per_page?: number;
  sort?: string;
  
  // Facets and aggregation
  facets?: string;
  facet_values?: string;
  
  // Response customization
  fields?: string;
  show_suggest?: boolean;
  search_again?: boolean;
  cb?: string; // JSONP callback
  
  // Custom fields for backward compatibility
  regReqMinAge?: string;
  limit?: number;
  offset?: number;
}

export interface Activity {
  assetGuid: string;
  assetName: string;
  assetDescriptions?: Array<{
    description: string;
    descriptionType: {
      descriptionTypeName: string;
      descriptionTypeId: string;
    };
  }>;
  place?: {
    placeName: string;
    cityName: string;
    stateProvinceCode: string;
    addressLine1Txt: string;
    postalCode: string;
  };
  activityStartDate?: string;
  activityEndDate?: string;
  assetLegacyData?: {
    participationCriteriaTxt?: string;
    estParticipantNb?: string;
  };
  assetCategories?: Array<{
    category: {
      categoryName: string;
      categoryId: string;
      categoryTaxonomy: string;
    };
  }>;
  contactName?: string;
  contactPhone?: string;
  contactEmailAdr?: string;
  registrationUrlAdr?: string;
  homePageUrlAdr?: string;
}

export interface SearchResponse {
  total_results: number;
  items_per_page: number;
  start_index: number;
  results: Activity[];
  facets?: {
    [key: string]: {
      values: Array<{
        value: string;
        count: number;
      }>;
    };
  };
  facet_values?: any[];
  suggestions?: string[];
  original_query?: string;
  actual_query?: string;
}

export interface ActivityDetails extends Activity {
  assetPrices?: Array<{
    priceTypeName: string;
    priceAmt: number;
  }>;
}
