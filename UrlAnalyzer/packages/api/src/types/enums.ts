export enum UserType {
	Admin,
	Staff,
	User,
}

export enum LoginMethod {
	Email,
	Google,
	Github,
	Discord,
}

export enum ThreadEntryType {
	Executable = 'EXECUTABLE',
	ThreadEntryTypeUnspecified = 'THREAT_ENTRY_TYPE_UNSPECIFIED',
	Url = 'URL',
}

export enum ThreadType {
	Malware = 'MALWARE',
	PotentiallyHarmfulApplication = 'POTENTIALLY_HARMFUL_APPLICATION',
	SocialEngineering = 'SOCIAL_ENGINEERING',
	ThreadTypeUnspecified = 'THREAT_TYPE_UNSPECIFIED',
	UnwantedSoftware = 'UNWANTED_SOFTWARE',
}

export enum PlatformType {
	AllPlatforms = 'ALL_PLATFORMS',
	Android = 'ANDROID',
	AnyPlatform = 'ANY_PLATFORM',
	Chrome = 'CHROME',
	Ios = 'IOS',
	Linux = 'LINUX',
	Osx = 'OSX',
	PlatformTypeUnspecified = 'PLATFORM_TYPE_UNSPECIFIED',
	Windows = 'WINDOWS',
}

export enum TransparencyReportGenericStatus {
	NoUnsafeContentFound = 1,
	UnsafeContentFound,
	SomePagesUnsafe,
	Whitelisted,
	NotCommonDownloads,
	NoDataAvailable,
}

export enum TransparencyReportFlags {
	SendsVisitorsToMalwareSites,
	InstallMalwareOrMaliciousCode,
	TrickUsersIntoSharingPersonalInfo,
	ContainsMalwareOrMaliciousCode,
	DistributesUncommonDownloads,
}
