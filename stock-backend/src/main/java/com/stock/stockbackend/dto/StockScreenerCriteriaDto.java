package com.stock.stockbackend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockScreenerCriteriaDto {

    private String sector;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Long minVolume;
    private BigDecimal minChangePercent;
    private BigDecimal maxChangePercent;
    private String sortBy; // "price", "volume", "changePercent", "marketCap", "ticker"
    private String direction; // "ASC" or "DESC"
}
