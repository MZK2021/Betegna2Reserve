import { Router } from "express";
import { ads } from "../data/store";
import { logEvent } from "../analytics/logger";

const router = Router();

router.get("/", (req, res) => {
  const { position, country, city } = req.query;
  let result = ads.filter((a) => a.active);

  if (position) result = result.filter((a) => a.position === position);
  if (country) result = result.filter((a) => !a.countries || a.countries.includes(String(country)));
  if (city) result = result.filter((a) => !a.cities || a.cities.includes(String(city)));

  return res.json(result);
});

router.post("/:id/click", (req, res) => {
  const ad = ads.find((a) => a.id === req.params.id);
  if (!ad) {
    return res.status(404).json({ error: "Ad not found" });
  }
  logEvent("ad_clicked", {
    properties: {
      ad_id: ad.id,
      position: ad.position,
      country: req.body?.country,
      city: req.body?.city,
    },
  });
  return res.json({ success: true });
});

export const adsRouter = router;


