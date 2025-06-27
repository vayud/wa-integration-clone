-- `wa-integration`.api_logs definition
CREATE TABLE `api_logs` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`app_name` varchar(512) DEFAULT NULL,
	`hub_portal_id` bigint(20) DEFAULT 1,
	`origin` varchar(512) DEFAULT NULL,
	`endpoint` mediumtext DEFAULT NULL,
	`payload` longtext DEFAULT NULL,
	`method` enum ('GET', 'POST', 'PATCH', 'PUT', 'DELETE') DEFAULT NULL,
	`response` longtext DEFAULT NULL,
	`http_code` int(11) DEFAULT NULL,
	`type` varchar(512) NOT NULL,
	`file_name` varchar(512) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_type` (`type`),
	KEY `idx_http_code` (`http_code`),
	KEY `idx_file_name` (`file_name`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.app_installs definition
CREATE TABLE `app_installs` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) DEFAULT 1,
	`hub_timezone` varchar(128) DEFAULT NULL,
	`install_code` varchar(2048) NOT NULL,
	`refresh_token` varchar(2048) NOT NULL,
	`access_token` varchar(2048) NOT NULL,
	`status` enum ('Active', 'Inactive') NOT NULL DEFAULT 'Active',
	`last_installed` timestamp NOT NULL DEFAULT current_timestamp(),
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.applications definition
CREATE TABLE `applications` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`app_name` varchar(512) DEFAULT NULL,
	`install_id` int(11) DEFAULT NULL,
	`portal_id` int(11) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.billing_details definition
CREATE TABLE `billing_details` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) DEFAULT 1,
	`first_name` varchar(512) NOT NULL,
	`last_name` varchar(512) NOT NULL,
	`full_name` varchar(1025) GENERATED ALWAYS AS (concat (`first_name`, ' ', `last_name`)) STORED,
	`email` varchar(512) NOT NULL,
	`phone_number` varchar(16) NOT NULL,
	`company` varchar(512) NOT NULL,
	`country` varchar(512) NOT NULL,
	`provider` varchar(512) NOT NULL,
	`billing_cycle` enum ('Monthly', 'Yearly') NOT NULL DEFAULT 'Monthly',
	`billing_plan` enum ('Starter', 'Professional') DEFAULT NULL,
	`comment` text DEFAULT NULL,
	`billing_amount` varchar(255) DEFAULT NULL,
	`demo_start` date NOT NULL DEFAULT '0000-00-00',
	`demo_end` date NOT NULL DEFAULT '0000-00-00',
	`billing_status` enum (
		'Active',
		'Cancelled',
		'Inactive',
		'Trialing',
		'Paused'
	) NOT NULL DEFAULT 'Inactive',
	`billing_start` date DEFAULT NULL,
	`billing_end` date DEFAULT NULL,
	`customer_id` varchar(512) DEFAULT NULL,
	`subscription_id` varchar(512) DEFAULT NULL,
	`payment_link` varchar(512) DEFAULT NULL,
	`billing_name` varchar(512) DEFAULT NULL,
	`billing_email` varchar(512) DEFAULT NULL,
	`billing_address` varchar(512) DEFAULT NULL,
	`billing_city` varchar(512) DEFAULT NULL,
	`billing_state` varchar(512) DEFAULT NULL,
	`billing_country` varchar(512) DEFAULT NULL,
	`billing_postal_code` varchar(16) DEFAULT NULL,
	`http_cookie` varchar(512) DEFAULT NULL,
	`remote_address` varchar(255) DEFAULT NULL,
	`ua_platform` varchar(512) DEFAULT NULL,
	`ua_version` varchar(512) DEFAULT NULL,
	`user_agent` text DEFAULT NULL,
	`create_contacts_for_incoming_messages` tinyint (1) NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_customer_id` (`customer_id`),
	KEY `idx_subscription_id` (`subscription_id`),
	KEY `idx_billing_status` (`billing_status`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.content_templates definition
CREATE TABLE `content_templates` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) NOT NULL DEFAULT 1,
	`template_id` varchar(512) NOT NULL,
	`template_name` varchar(512) NOT NULL,
	`template_type` enum (
		'twilio/call-to-action',
		'twilio/card',
		'twilio/carousel',
		'twilio/list-picker',
		'twilio/location',
		'twilio/media',
		'twilio/quick-reply',
		'twilio/text',
		'whatsapp/authentication',
		'whatsapp/card'
	) DEFAULT NULL,
	`template_lang_code` varchar(32) NOT NULL DEFAULT 'en',
	`template_header_type` enum ('media', 'text', 'none') DEFAULT 'none',
	`template_header` text DEFAULT NULL,
	`template_text` longtext DEFAULT NULL,
	`template_cards` longtext DEFAULT NULL,
	`template_items` text DEFAULT NULL,
	`template_footer` varchar(64) DEFAULT NULL,
	`variable_count` int(11) NOT NULL DEFAULT 0,
	`sample_variables` varchar(512) DEFAULT NULL,
	`media_url` varchar(512) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`),
	KEY `idx_template_id` (`template_id`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.countries definition
CREATE TABLE `countries` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`countrycode` varchar(100) NOT NULL,
	`country` varchar(512) NOT NULL,
	`code` varchar(100) NOT NULL,
	`call_code` varchar(100) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_call_code` (`call_code`),
	KEY `idx_country_code` (`countrycode`),
	KEY `idx_code` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.dev_portals definition
CREATE TABLE `dev_portals` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`portal_id` bigint(20) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.invoice_details definition
CREATE TABLE `invoice_details` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`customer_id` varchar(512) NOT NULL,
	`subscription_id` varchar(512) NOT NULL,
	`pay_status` varchar(512) NOT NULL DEFAULT 'Paid',
	`amount_due` varchar(64) DEFAULT NULL,
	`amount_paid` varchar(64) DEFAULT NULL,
	`amount_remaining` varchar(64) DEFAULT NULL,
	`period_start` datetime NOT NULL,
	`period_end` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.kl_credentials definition
CREATE TABLE `kl_credentials` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) NOT NULL,
	`whatsapp_sid` varchar(512) NOT NULL,
	`whatsapp_api_key` varchar(512) NOT NULL,
	`whatsapp_number` varchar(16) NOT NULL,
	`status` enum ('Active', 'Inactive') NOT NULL DEFAULT 'Active',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.kl_language_codes definition
CREATE TABLE `kl_language_codes` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`language` varchar(100) NOT NULL,
	`code` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.kl_templates definition
CREATE TABLE `kl_templates` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) NOT NULL,
	`template_name` varchar(512) NOT NULL,
	`template_type` enum ('text', 'media') NOT NULL DEFAULT 'text',
	`template_lang_code` varchar(32) NOT NULL DEFAULT 'en',
	`message` text DEFAULT NULL,
	`parameter_count` int(11) NOT NULL DEFAULT 0,
	`suggested_parameters` varchar(512) DEFAULT NULL,
	`attachment_type` enum ('audio', 'document', 'image', 'video') DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`),
	KEY `idx_template_name` (`template_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

CREATE TABLE `logs` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) DEFAULT 1,
	`user_id` int(11) NOT NULL,
	`user` varchar(255) NOT NULL,
	`action` varchar(512) NOT NULL,
	`comment` longtext DEFAULT NULL,
	`source` varchar(512) DEFAULT NULL,
	`referrer` varchar(512) DEFAULT NULL,
	`http_cookie` varchar(512) DEFAULT NULL,
	`remote_address` varchar(255) NOT NULL,
	`remote_port` int(11) NOT NULL,
	`ua_platform` varchar(512) DEFAULT NULL,
	`ua_version` varchar(512) DEFAULT NULL,
	`user_agent` text DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.messages definition
CREATE TABLE `messages` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`app_name` varchar(255) NOT NULL,
	`hub_portal_id` bigint(20) NOT NULL DEFAULT 1,
	`hub_user_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '0 - Sent from Workflow, 1 - Incoming Message, ####### - Sent by User ID',
	`hub_user_email` varchar(512) DEFAULT NULL,
	`firstname` varchar(128) DEFAULT NULL,
	`lastname` varchar(128) DEFAULT NULL,
	`fullname` varchar(1025) GENERATED ALWAYS AS (concat (`firstname`, ' ', `lastname`)) STORED,
	`contact_id` bigint(20) NOT NULL DEFAULT 101,
	`whatsapp_number` varchar(24) DEFAULT NULL,
	`campaign` varchar(256) DEFAULT NULL,
	`message_uid` varchar(512) DEFAULT NULL,
	`replied_to_message_uid` varchar(512) DEFAULT NULL,
	`replied_to_message_sender` varchar(24) DEFAULT NULL,
	`type` varchar(512) NOT NULL,
	`template_id` varchar(256) DEFAULT NULL,
	`template_type` enum (
		'twilio/call-to-action',
		'twilio/card',
		'twilio/carousel',
		'twilio/list-picker',
		'twilio/location',
		'twilio/media',
		'twilio/quick-reply',
		'twilio/text',
		'whatsapp/authentication',
		'whatsapp/card'
	) DEFAULT NULL,
	`template_header_type` enum ('media', 'text', 'none') DEFAULT 'none',
	`template_header` text DEFAULT NULL,
	`message` longtext DEFAULT NULL,
	`template_footer` varchar(64) DEFAULT NULL,
	`template_items` text DEFAULT NULL,
	`template_cards` longtext DEFAULT NULL,
	`location_coordinates` varchar(255) DEFAULT NULL,
	`media_url` text DEFAULT NULL,
	`message_status` enum (
		'accepted',
		'delivered',
		'failed',
		'read',
		'sent',
		'undelivered',
		'queued'
	) DEFAULT NULL,
	`status_event_id` varchar(512) DEFAULT NULL,
	`action` enum ('sent', 'received') DEFAULT NULL,
	`accepted_at` timestamp NULL DEFAULT current_timestamp(),
	`queued_at` timestamp NULL DEFAULT NULL,
	`sent_at` timestamp NULL DEFAULT NULL,
	`delivered_at` timestamp NULL DEFAULT NULL,
	`undelivered_at` timestamp NULL DEFAULT NULL,
	`failed_at` timestamp NULL DEFAULT NULL,
	`read_at` timestamp NULL DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`),
	KEY `idx_whatsapp_number` (`whatsapp_number`),
	KEY `idx_name_search` (`firstname`, `lastname`),
	KEY `idx_action` (`action`),
	KEY `idx_status` (`message_status`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.notifications definition
CREATE TABLE `notifications` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`user_id` int(11) NOT NULL,
	`source` varchar(255) DEFAULT NULL,
	`title` varchar(255) NOT NULL DEFAULT 'New Notification',
	`message` text DEFAULT NULL,
	`is_read` tinyint (1) DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_user_id` (`user_id`),
	KEY `idx_source` (`source`),
	KEY `idx_seen` (`is_read`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.pricing definition
CREATE TABLE `pricing` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`plan` varchar(512) DEFAULT NULL,
	`cycle` varchar(512) DEFAULT NULL,
	`price_id` varchar(512) DEFAULT NULL,
	`currency` varchar(512) DEFAULT NULL,
	`amount` float DEFAULT NULL,
	`pay_link_id` varchar(512) DEFAULT NULL,
	`pay_link` varchar(512) DEFAULT NULL,
	`status` TINYINT (1) NOT NULL DEFAULT 1 COMMENT '0 - Disabled | 1 - Enabled',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_plan` (`plan`),
	KEY `idx_price_id` (`price_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

CREATE TABLE `roles` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(64) DEFAULT NULL,
	`description` varchar(512) DEFAULT NULL,
	`status` TINYINT (1) NOT NULL DEFAULT 1 COMMENT '0 - Inactive | 1 - Active',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.settings definition
CREATE TABLE `settings` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(512) DEFAULT NULL,
	`value` varchar(512) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.tw_credentials definition
CREATE TABLE `tw_credentials` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) NOT NULL,
	`account_sid` varchar(128) NOT NULL,
	`account_auth_token` varchar(128) DEFAULT NULL,
	`messaging_service_sid` varchar(128) DEFAULT NULL,
	`whatsapp_sid` varchar(128) NOT NULL,
	`whatsapp_api_key` varchar(128) NOT NULL,
	`whatsapp_number` varchar(24) NOT NULL,
	`status` enum ('Active', 'Inactive') NOT NULL DEFAULT 'Active',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.tw_inbound_property_mapping definition
CREATE TABLE `tw_inbound_property_mapping` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) DEFAULT 0,
	`company` varchar(512) DEFAULT NULL,
	`property_name` varchar(512) DEFAULT NULL,
	`status` TINYINT (1) NOT NULL DEFAULT 1 COMMENT '0 - Disabled | 1 - Enabled',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	UNIQUE KEY `hub_portal_id` (`hub_portal_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.uploads definition
CREATE TABLE `uploads` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`file_name` varchar(512) DEFAULT NULL,
	`file_path` text NOT NULL,
	`file_type` varchar(512) DEFAULT NULL,
	`file_size` bigint(24) NOT NULL,
	`file_checksum` text DEFAULT NULL,
	`created_at` timestamp NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.users definition
CREATE TABLE `users` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`hub_portal_id` bigint(20) NOT NULL DEFAULT 1,
	`hub_user_id` bigint(20) NOT NULL DEFAULT 1,
	`firstname` varchar(256) DEFAULT NULL,
	`lastname` varchar(256) DEFAULT NULL,
	`name` varchar(515) GENERATED ALWAYS AS (concat (`firstname`, ' ', `lastname`)) STORED,
	`role_id` int(11) NOT NULL DEFAULT 4 COMMENT '1 - Developer | 2 - Admin | 3 - Admin User | 4 - User',
	`email` varchar(255) NOT NULL UNIQUE,
	`password_hash` varchar(512) NOT NULL,
	`last_login` timestamp NULL DEFAULT NULL,
	`last_password_change` timestamp NULL DEFAULT NULL,
	`password_reset_code` varchar(8) DEFAULT NULL,
	`last_password_reset_request` timestamp NULL DEFAULT NULL,
	`status` enum ('Active', 'Inactive') NOT NULL DEFAULT 'Active',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_hub_portal_id` (`hub_portal_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET DEFAULT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.webhook_queue definition
CREATE TABLE `webhook_queue` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
	`source` varchar(255) DEFAULT NULL,
	`callback_id` varchar(255) DEFAULT NULL,
	`payload` longtext DEFAULT NULL,
	`status` enum (
		'completed',
		'failed',
		'pending',
		'processing',
		'skipped'
	) DEFAULT 'pending',
	`file_name` varchar(255) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_file` (`file_name`),
	KEY `idx_status` (`status`),
	KEY `idx_status_created_at` (`status`, `created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- `wa-integration`.webhooks definition
CREATE TABLE `webhooks` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`app_name` varchar(255) DEFAULT NULL,
	`hub_portal_id` bigint(20) DEFAULT 1,
	`source` varchar(255) DEFAULT NULL,
	`type` varchar(255) NOT NULL,
	`payload` longtext DEFAULT NULL,
	`file_name` varchar(255) NOT NULL,
	`status` TINYINT (1) NOT NULL DEFAULT 1 COMMENT '0 - Not Processed | 1 - Processed',
	`comment` text DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_source` (`source`),
	KEY `idx_type` (`type`),
	KEY `idx_file` (`file_name`),
	KEY `idx_status` (`status`),
	KEY `idx_created_at` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;