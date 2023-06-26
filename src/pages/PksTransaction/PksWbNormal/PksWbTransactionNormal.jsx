import { useState, useEffect } from "react";
import { Grid } from "@mui/material";

import { useForm, Form } from "../../../utils/useForm";
import Controls from "../../../components/Controls";

import * as TransactionAPI from "../../../api/TransactionAPI";

const siteItems = [
  { value: 1, label: "PKS-01" },
  { value: 2, label: "PKS-02" },
];

const PksWbTransactionNormal = () => {
  const { values, setValues, handleInputChange } = useForm(
    TransactionAPI.InitialData
  );

  return (
    <Form>
      <Grid container>
        <Grid item xs={6}>
          <Controls.Input
            label="BON Trip No"
            name="bonTripNo"
            value={values.bonTripNo}
            onChange={handleInputChange}
          />
          <Controls.Input
            label="Plat No"
            name="vehiclePlateNo"
            value={values.vehiclePlateNo}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <Controls.RadioGroup
            label="Origin Site"
            name="originSiteId"
            value={values.originSiteId}
            onChange={handleInputChange}
            items={siteItems}
          />

          <Controls.Select
            label="Destination Site"
            name="destinationSiteId"
            value={values.destinationSiteId}
            onChange={handleInputChange}
            items={siteItems}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default PksWbTransactionNormal;
