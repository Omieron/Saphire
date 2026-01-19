package com.crownbyte.Saphire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SaphireApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaphireApplication.class, args);
	}

}
