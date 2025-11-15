export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  JobDetail: { jobId: string };
  CreateJob: {
    selectedLocation?: { latitude: number; longitude: number; address: string };
  };
  EditJob: {
    jobId: string;
  };
  LocationPicker: undefined;
  ApplicationsList: { jobId: string };
  Profile: { userId?: string };
  EditProfile: undefined;
  Reviews: { volunteerId: string };
};

export type MainTabParamList = {
  Explore: undefined;
  MyJobs: undefined;
  Profile: undefined;
};
