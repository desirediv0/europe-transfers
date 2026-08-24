import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getOrCreateSettings = async () => {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
};

export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  return apiResponse(res, 200, "Site settings retrieved", settings);
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { showPrivateTransfers, showVanCoach, showPackages, showSightseeing } = req.body;

  await getOrCreateSettings();

  const dataToUpdate = {};
  if (showPrivateTransfers !== undefined) dataToUpdate.showPrivateTransfers = showPrivateTransfers;
  if (showVanCoach !== undefined) dataToUpdate.showVanCoach = showVanCoach;
  if (showPackages !== undefined) dataToUpdate.showPackages = showPackages;
  if (showSightseeing !== undefined) dataToUpdate.showSightseeing = showSightseeing;

  const settings = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: dataToUpdate,
  });

  return apiResponse(res, 200, "Site settings updated", settings);
});
