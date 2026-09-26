package com.stock.stockbackend.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockScreenerResultDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String ticker;
    private String companyName;
    private String sector;
    private BigDecimal price;
    private BigDecimal changePercent;
    private Long volume;
    private BigDecimal marketCap;
    private BigDecimal peRatio;
}
