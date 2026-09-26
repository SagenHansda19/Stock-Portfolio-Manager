package com.stock.stockbackend.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketNewsDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String category;
    private Long datetime;
    private String headline;
    private String image;
    private String related;
    private String source;
    private String summary;
    private String url;
}
