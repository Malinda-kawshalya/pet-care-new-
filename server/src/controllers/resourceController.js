export function createResourceController(Model, populate = []) {
  const applyPopulate = (query) => populate.reduce((nextQuery, field) => nextQuery.populate(field), query);

  return {
    async list(req, res, next) {
      try {
        const items = await applyPopulate(Model.find().sort({ createdAt: -1 })).limit(100);
        res.json({ items });
      } catch (error) {
        next(error);
      }
    },
    async get(req, res, next) {
      try {
        const item = await applyPopulate(Model.findById(req.params.id));
        if (!item) {
          res.status(404);
          throw new Error("Resource not found");
        }
        res.json({ item });
      } catch (error) {
        next(error);
      }
    },
    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        res.status(201).json({ item });
      } catch (error) {
        next(error);
      }
    },
    async update(req, res, next) {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) {
          res.status(404);
          throw new Error("Resource not found");
        }
        res.json({ item });
      } catch (error) {
        next(error);
      }
    },
    async remove(req, res, next) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) {
          res.status(404);
          throw new Error("Resource not found");
        }
        res.json({ message: "Resource deleted" });
      } catch (error) {
        next(error);
      }
    }
  };
}
