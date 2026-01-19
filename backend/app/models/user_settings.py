from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from ..db.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    theme = Column(String, default='light')
    language_preferences = Column(JSON, default=dict)
    email_notifications = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")