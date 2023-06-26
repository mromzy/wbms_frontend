import { Box, Card, Paper, Typography } from "@mui/material";

const PageHeader = (props) => {
  const { title, subTitle, icon } = props;

  return (
    <Paper elevation={0} square sx={{ backgroundColor: "#fdfdff", mb: 2 }}>
      <Box sx={{ p: 1, display: "flex" }}>
        <Card
          sx={{
            display: "inline-block",
            p: 2,
            color: "#3c44b1",
          }}
        >
          {icon}
        </Card>
        <Box sx={{ pl: 2 }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="subtitle2" component="div" sx={{ opacity: 0.6 }}>
            {subTitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;
